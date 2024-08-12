import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function ContainsDash(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'containsDash',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string' && value.includes('-');
        },
        defaultMessage(args: ValidationArguments) {
          return `The string must contain at least one dash (-).`;
        },
      },
    });
  };
}