const fs = require('fs');
const { awscdk } = require('projen');

const exampleFile = fs
  .readFileSync('src/integ.default.ts', 'utf8')
  .split('\n');
const example = exampleFile.slice(8, exampleFile.length - 7);

// const propertiesFile = fs.readFileSync('API.md', 'utf8');
const propertiesFile = 'soon ...';

const cdkVersion = '2.3.0';

const deps = ['cdk-iam-floyd'];
const devDeps = [`aws-cdk@${cdkVersion}`];

const shortDescription = 'An AWS CDK custom construct for deploying neko to you AWS Account. ...';


const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Martin Mueller',
  authorAddress: 'damadden88@googlemail.com',
  jsiiFqn: 'projen.AwsCdkConstructLibrary',
  minNodeVersion: '14.17.0',
  cdkVersion,
  cdkVersionPinning: false,
  description: shortDescription,
  defaultReleaseBranch: 'main',
  name: 'cdk-neko',
  repositoryUrl: 'https://github.com/mmuller88/cdk-neko',
  projenUpgradeSecret: 'PROJEN_GITHUB_TOKEN',
  autoApproveOptions: {
    allowedUsernames: ['aws-cdk-automation', 'github-bot'],
    secret: 'GITHUB_TOKEN',
  },
  peerDeps: deps,
  devDeps: [...deps, ...devDeps],
  catalog: {
    twitter: 'MartinMueller_',
  },
  keywords: [
    'awscdk',
    'neko',
    'aws',
    'cdk',
  ],
  publishToPypi: {
    distName: 'cdk-neko',
    module: 'cdk_neko',
  },
  readme: {
    contents: `[![NPM version](https://badge.fury.io/js/cdk-neko.svg)](https://badge.fury.io/js/cdk-neko)
[![PyPI version](https://badge.fury.io/py/cdk-neko.svg)](https://badge.fury.io/py/cdk-neko)
[![.NET version](https://img.shields.io/nuget/v/com.github.mmuller88.awsCdkBuildBadge.svg?style=flat-square)](https://www.nuget.org/packages/com.github.mmuller88.cdkNeko/)
![Release](https://github.com/mmuller88/cdk-neko/workflows/Release/badge.svg)

Author = <https://martinmueller.dev>

# cdk-neko
${shortDescription}

# AWS AMI
If you just want to make the Neco CDK stack running in your account try my [Neko AWS Marketplace AMI](https://aws.amazon.com/marketplace/pp/prodview-XXX). With just $1 Neko .... Don't forget the terminate the Ec2 instance when the Neko stack got created for not paying more than that $1 :).

With buying the AMI you support my on my passion for creating open source products like this cdk-neko construct. Furthermore you enable me to work on future features like mentioned in the **Planned Features** section. Thank you so much :) !

# Example
\`\`\`ts
import { NekoAudit } from 'cdk-neko';
...
${example.join('\n')}
\`\`\`

# Architect diagram
![diagram](https://raw.githubusercontent.com/mmuller88/cdk-neko/main/misc/cdk-neco.png)

# cdk-neko Properties
cdk-neko supports some properties to tweak your stack. Like for running a Cloudwatch schedule to regualary run the Neko scan with a defined cron expression.

${propertiesFile}

# Cross Account Buckets

By providing your own Bucket you can have the CodeBuild project drop the Neko results in another account. Make sure that you have your Bucket policy setup to allow the account running the Neko reports access to writing those record.
Additionally, you will probably want to provide an \`additionalS3CopyArgs: '--acl bucket-owner-full-control'\` to ensure that those object can be read by the account owner.

# Planned Features
* Do an HTTPS version together with using a custom domain and ssl certs created from letscert

# Architecture
![cfn](misc/cfn.jpg)

# Misc

\`\`\`sh
yes | yarn destroy && yarn deploy --require-approval never
\`\`\`

Rerun Neko on deploy

\`\`\`sh
yarn deploy --require-approval never
\`\`\`

# Thanks To
* ...
* [Projen](https://github.com/projen/projen) project and the community around it

    `,
  },
});

project.setScript('deploy', './node_modules/.bin/cdk deploy');
project.setScript('destroy', './node_modules/.bin/cdk destroy');
project.setScript('synth', './node_modules/.bin/cdk synth');

const common_exclude = ['cdk.out'];
project.npmignore.exclude(...common_exclude);
project.gitignore.exclude(...common_exclude);

project.synth();