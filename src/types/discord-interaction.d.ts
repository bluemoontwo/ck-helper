import {Interaction} from "discord.js";

export type InteractionCallbackMethod<T extends Interaction> = (interaction: T) => any;

export type InteractionCallbackPropertyDescriptor<T extends Interaction> =
  TypedPropertyDescriptor<InteractionCallbackMethod<T>>;

export type InteractionCallbackMethodDecorator =
  <T extends Interaction>(
    target: Object,
    propertyKey: string,
    descriptor: InteractionCallbackPropertyDescriptor<T>
  ) => InteractionCallbackPropertyDescriptor<T> | void;
