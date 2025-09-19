# Deploy AWS CDK - Quiz Adaptativo

## Pré-requisitos

1. **AWS CLI configurado:**
```bash
aws configure
```

2. **Node.js e npm instalados**

3. **AWS CDK instalado globalmente:**
```bash
npm install -g aws-cdk
```

## Deploy

1. **Instalar dependências:**
```bash
cd infrastructure
npm install
```

2. **Bootstrap CDK (primeira vez):**
```bash
cdk bootstrap
```

3. **Deploy da aplicação:**
```bash
cdk deploy
```

## Arquitetura AWS

- **Frontend**: S3 + CloudFront
- **Backend**: ECS Fargate + Application Load Balancer  
- **Database**: RDS PostgreSQL
- **Network**: VPC com 2 AZs

## Custos Estimados

- **RDS t3.micro**: ~$13/mês
- **ECS Fargate**: ~$15/mês
- **ALB**: ~$16/mês
- **NAT Gateway**: ~$32/mês
- **CloudFront**: ~$1/mês

**Total**: ~$77/mês

## Comandos Úteis

```bash
# Ver diferenças antes do deploy
cdk diff

# Destruir infraestrutura
cdk destroy

# Listar stacks
cdk list
```