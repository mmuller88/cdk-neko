import * as cdk from 'aws-cdk-lib';
// import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
// import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
// import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancedEc2Service } from 'aws-cdk-lib/aws-ecs-patterns';
// import * as route53 from 'aws-cdk-lib/aws-route53';
// import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
// import * as sns from 'aws-cdk-lib/aws-sns';
// import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';

// import * as logs from 'aws-cdk-lib/aws-logs';
// import * as statement from 'cdk-iam-floyd';
import { Construct } from 'constructs';

export interface NekoStackProps {

  /**
   * Options to pass to Prowler command, make sure at least -M junit-xml is used for CodeBuild reports. Use -r for the region to send API queries, -f to filter only one region, -M output formats, -c for comma separated checks, for all checks do not use -c or -g, for more options see -h. For a complete assessment use  "-M text,junit-xml,html,csv,json", for SecurityHub integration use "-r region -f region -M text,junit-xml,html,csv,json,json-asff -S -q"
   * @default '-M text,junit-xml,html,csv,json'
   */
  // readonly prowlerOptions?: string;

  /**
   * An Prowler-specific Allowlist file. If a value is provided then this is passed to Prowler on runs using the '-w' flag.
   * If no value is provided, the -w parameter is not used. If you provide an asset that is zipped, it must contain
   * an 'allowlist.txt' file which will be passed to Prowler.
   *
   * @example new Asset(this, 'AllowList', { path: path.join(__dirname, 'allowlist.txt') })
   * @default undefined
   */
  // readonly allowlist?: Asset;

  /**
   * ...
   *
   * @example 'example.com'
   */
  // readonly domainName: string;
}

/**
 * Creates a CodeBuild project to audit an AWS account with Prowler and stores the html report in a S3 bucket. This will run once at the beginning and on a schedule afterwards. Partial contribution from https://github.com/stevecjones
 */
export class NekoStack extends Construct {
  // serviceName: string;

  constructor(parent: cdk.Stack, id: string) {
    super(parent, id);

    // defaults
    // this.serviceName = props?.serviceName ? props.serviceName : 'prowler';

    // prowlerBuild.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('SecurityAudit'));
    // prowlerBuild.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('job-function/ViewOnlyAccess'));
    // prowlerBuild.addToRolePolicy(new statement.Dax().allow().to());
    // prowlerBuild.addToRolePolicy(new statement.Ds().allow().toListAuthorizedApplications());

    // const myRole = new iam.Role(this, 'MyRole', { assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com') });

    const vpc = new ec2.Vpc(this, 'vpc', { maxAzs: 2 });
    const cluster = new ecs.Cluster(this, 'EcsCluster', { vpc });

    cluster.addCapacity('AsgCapacityProvider', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      minCapacity: 1,
      maxCapacity: 1,
    });

    // const recordName = 'neko';

    // const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: props.domainName });

    // const certificate = new certificatemanager.DnsValidatedCertificate(this, 'Certificate', {
    //   domainName: `${recordName}.${props.domainName}`,
    //   hostedZone: zone,
    // });

    const traefikService = new ApplicationLoadBalancedEc2Service(this, 'ApplicationLoadBalancedEc2Service', {
      cluster,
      // certificate,
      memoryReservationMiB: 400,
      desiredCount: 1,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry('traefik:2.4'),
        containerPort: 8080,
        enableLogging: true,
        environment: {
          TZ: 'Europe/Vienna',
        },
      },
      publicLoadBalancer: true,
    });

    new cdk.CfnOutput(this, 'NekoUrl', {
      // value: nekoRecord.domainName,
      value: traefikService.loadBalancer.loadBalancerDnsName,
    });

    traefikService.taskDefinition.addContainer('nekoContainer', {
      image: ecs.ContainerImage.fromRegistry('m1k1o/neko-rooms:latest'),
      environment: {
        TZ: 'Europe/Vienna',
        NEKO_ROOMS_EPR: '59000-59049',
        NEKO_ROOMS_NAT1TO1: 'localhost', // IP address of your server
        NEKO_ROOMS_TRAEFIK_ENTRYPOINT: 'web',
        NEKO_ROOMS_TRAEFIK_NETWORK: 'neko-rooms-traefik',
        NEKO_ROOMS_INSTANCE_URL: 'http://localhost:8080/', // external URL
      },
      dockerLabels: {
        'traefik.enable': 'true',
        'traefik.http.services.neko-rooms-frontend.loadbalancer.server.port': '8080',
        'traefik.http.routers.neko-rooms.entrypoints': 'web',
        'traefik.http.routers.neko-rooms.rule': 'HostRegexp(`{host:.+}`)',
        'traefik.http.routers.neko-rooms.priority': '1',
      },
    });

    // const nekoRecord = new route53.ARecord(this, 'nekoRecord', {
    //   recordName,
    //   target: route53.RecordTarget.fromAlias(new route53Targets.LoadBalancerTarget(albEc2Service.loadBalancer)),
    //   zone,
    // });

    // albEc2Service.targetGroup.configureHealthCheck({
    //   enabled: true,
    //   path: '/healthz',
    //   healthyHttpCodes: '200',
    // });

    // const alarm = new cloudwatch.Alarm(this, 'nekoAlarm', {
    //   metric: albEc2Service.targetGroup.metricHealthyHostCount(),
    //   comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD,
    //   treatMissingData: cloudwatch.TreatMissingData.BREACHING,
    //   threshold: 0,
    //   evaluationPeriods: 1,
    // });
    // const topic = new sns.Topic(this, 'nekoAlarmTopic');
    // topic.addSubscription(
    //   new subscriptions.EmailSubscription('cloud-notifications@neatleaf.com'),
    // );
    // alarm.addAlarmAction(new actions.SnsAction(topic));

  }
}