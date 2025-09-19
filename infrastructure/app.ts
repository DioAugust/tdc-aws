#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { QuizStack } from './quiz-stack';

const app = new cdk.App();
new QuizStack(app, 'QuizAdaptativoStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  tags: {
    Project: 'q-developer-quest-tdc-2025',
    Environment: 'production'
  }
});