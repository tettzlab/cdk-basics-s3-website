import * as cdk from 'aws-cdk-lib'
import { Template } from 'aws-cdk-lib/assertions'
import * as CdkApp from '../stack/cdk-basics-s3-website-stack'

describe('CdkBasicsS3WebsiteStack', () => {
  const app = new cdk.App()
  const stack = new CdkApp.CdkBasicsS3WebsiteStack(app, 'MyTestStack')

  test('should have 1 bucket.', () => {
    Template.fromStack(stack).resourceCountIs('AWS::S3::Bucket', 1)
  })
})
