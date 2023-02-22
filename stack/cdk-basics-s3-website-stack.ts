import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { S3Website } from '../lib/s3-website'

export class CdkBasicsS3WebsiteStack extends Stack {
  public constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const environment = this.node.tryGetContext('environment') ?? 'production'

    const s3Website = new S3Website(this, 'S3Website', {
      production: environment === 'production',
      assetPath: './public',
    })

    new CfnOutput(this, 'BucketName', {
      value: s3Website.bucket.bucketName,
    })
    new CfnOutput(this, 'DomainName', {
      value: s3Website.domainName,
    })
    new CfnOutput(this, 'LegacyGlobalEndpointUrl', {
      value: s3Website.legacyGlobalEndpointUrl,
    })
    new CfnOutput(this, 'PathStyleUrl', {
      value: s3Website.pathStyleUrl,
    })
    new CfnOutput(this, 'VirtualHostedStyleUrl', {
      value: s3Website.virtualHostedStyleUrl,
    })
    new CfnOutput(this, 'WebsiteUrl', {
      value: s3Website.websiteUrl,
    })
  }
}
