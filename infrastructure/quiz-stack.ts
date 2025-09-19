import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export class QuizStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'QuizVpc', {
      maxAzs: 2,
      natGateways: 1
    });

    // RDS PostgreSQL
    const database = new rds.DatabaseInstance(this, 'QuizDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      databaseName: 'quiz_db',
      deleteAutomatedBackups: true,
      deletionProtection: false
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'QuizCluster', {
      vpc,
      containerInsights: true
    });

    // Backend Service
    const backendService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'QuizBackend', {
      cluster,
      cpu: 256,
      memoryLimitMiB: 512,
      desiredCount: 1,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../backend'),
        containerPort: 3001,
        environment: {
          NODE_ENV: 'production',
          DB_HOST: database.instanceEndpoint.hostname,
          DB_PORT: '5432',
          DB_NAME: 'quiz_db'
        },
        secrets: {
          DB_PASSWORD: ecs.Secret.fromSecretsManager(database.secret!, 'password'),
          DB_USER: ecs.Secret.fromSecretsManager(database.secret!, 'username')
        }
      },
      publicLoadBalancer: true
    });

    // Allow backend to connect to database
    database.connections.allowFrom(backendService.service, ec2.Port.tcp(5432));

    // S3 Bucket for Frontend
    const frontendBucket = new s3.Bucket(this, 'QuizFrontendBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Deploy Frontend to S3
    new s3deploy.BucketDeployment(this, 'DeployFrontend', {
      sources: [s3deploy.Source.asset('../frontend')],
      destinationBucket: frontendBucket
    });

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'QuizDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(frontendBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.LoadBalancerV2Origin(backendService.loadBalancer, {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY
          }),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
        }
      }
    });

    // Outputs
    new cdk.CfnOutput(this, 'FrontendUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'Quiz Frontend URL'
    });

    new cdk.CfnOutput(this, 'BackendUrl', {
      value: `http://${backendService.loadBalancer.loadBalancerDnsName}`,
      description: 'Quiz Backend URL'
    });
  }
}