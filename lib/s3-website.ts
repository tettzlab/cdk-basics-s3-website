import { Stack, StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'

export interface S3WebsiteProps extends StackProps {
  /** (Optional) A flag which should be set to true when building a production stack. false otherwise. */
  production?: boolean

  /** The path to a local .zip file or a directory of the asset to publish. */
  assetPath: string

  /** (Optional) your custom BucketDeploymentProps for deploying the assets to the bucket. */
  bucketDeploymentProps?: s3deploy.BucketDeploymentProps

  /** (Optional) your custom BucketProps for constructing the bucket. */
  bucketProps?: s3.BucketProps
}

export class S3Website extends Construct {
  public readonly bucket: s3.Bucket
  public readonly domainName: string
  public readonly legacyGlobalEndpointUrl: string
  public readonly pathStyleUrl: string
  public readonly virtualHostedStyleUrl: string
  public readonly websiteUrl: string

  public constructor(scope: Construct, id: string, props: S3WebsiteProps) {
    super(scope, id)

    const production = props?.production !== false

    this.bucket = new s3.Bucket(this, 'Bucket', {
      autoDeleteObjects: !production, // NOTICE!
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: false,
      publicReadAccess: true,
      removalPolicy: production ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY, // NOTICE!
      versioned: false,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: '404.html',
      websiteRedirect: undefined,
      websiteRoutingRules: undefined,
      ...(props?.bucketProps ?? {}),
    })

    new s3deploy.BucketDeployment(this, 'BucketDeployment', {
      ...(props?.bucketDeploymentProps ?? {}),
      destinationBucket: this.bucket,
      sources: [s3deploy.Source.asset(props.assetPath)],
    })

    this.bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.StarPrincipal()],
        actions: ['s3:GetObject'],
        resources: [`${this.bucket.bucketArn}/*`],
      })
    )

    this.domainName = this.bucket.bucketDomainName
    this.legacyGlobalEndpointUrl = `https://${this.bucket.bucketName}.s3.amazonaws.com`
    this.pathStyleUrl = this.bucket.urlForObject()
    this.virtualHostedStyleUrl = `https://${this.bucket.bucketName}.s3.${
      Stack.of(this).region
    }.amazonaws.com`
    this.websiteUrl = this.bucket.bucketWebsiteUrl
  }
}
