import * as cdk from 'aws-cdk-lib';

import { NekoStack } from '../src/index';

// const app = new cdk.App();

// const stack = new cdk.Stack(app, 'Neko-stack');

// new NekoStack(stack, 'NekoStack');

export class IntegTesting {
  readonly stack: cdk.Stack[];
  constructor() {
    const app = new cdk.App();

    const stack = new cdk.Stack(app, 'Neko-stack');

    new NekoStack(stack, 'NekoStack');

    this.stack = [stack];
  }
}

new IntegTesting();
