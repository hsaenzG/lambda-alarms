import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Construct } from 'constructs';
import * as path from 'path';

export class LambdaAlarmsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create SNS topic
    const snsTopic = new sns.Topic(this, 'AlarmTopic');
    //snsTopic.addSubscription(new subscriptions.EmailSubscription('your-email@example.com'));
    snsTopic.addSubscription(new subscriptions.EmailSubscription('hazel.saenz@gmail.com'));

    // Function to create a Lambda with basic settings
    const createLambda = (functionName: string) => {
      return new lambda.Function(this, functionName, {
        functionName,
        runtime: lambda.Runtime.PYTHON_3_8,
        handler: functionName +'.handler',
        code: lambda.Code.fromAsset(path.join(__dirname, '/../src/functions')),
      });
    };

    // Create three Lambda functions
    const lambda1 = createLambda('Lambda1');
    const lambda2 = createLambda('Lambda2');
    const lambda3 = createLambda('Lambda3');

    // Create a composite CloudWatch metric that includes all Lambda durations By lambda
    const compositeMetric = new cloudwatch.MathExpression({
      expression: "MAX([m1, m2, m3])",
      usingMetrics: {
        m1: new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Duration',
          dimensionsMap: { FunctionName: lambda1.functionName },
          statistic: 'Average',
          period: cdk.Duration.minutes(1),
        }),
        m2: new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Duration',
          dimensionsMap: { FunctionName: lambda2.functionName },
          statistic: 'Average',
          period: cdk.Duration.minutes(1),
        }),
        m3: new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Duration',
          dimensionsMap: { FunctionName: lambda3.functionName },
          statistic: 'Average',
          period: cdk.Duration.minutes(1),
        }),
      },
    });

    // Create an alarm based on the composite metric
    const alarm = new cloudwatch.Alarm(this, 'LambdaDurationAlarm', {
      metric: compositeMetric,
      threshold: 2000, // 2 seconds
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });

    // Add SNS action to alarm
    alarm.addAlarmAction(new actions.SnsAction(snsTopic));
  }
}
