import {RESTPostAPIApplicationCommandsJSONBody} from "discord-api-types/v10";
import {Collection, Interaction} from "discord.js";
import "reflect-metadata";
import {
  InteractionCallbackMethod,
  InteractionCallbackMethodDecorator,
  InteractionCallbackPropertyDescriptor
} from "../types/discord-interaction";

export class InteractionCallbackManager {
  protected callbackFns: Collection<string, InteractionCallbackMethod<Interaction>>;

  constructor(o: any) {
    this.callbackFns = new Collection<string, InteractionCallbackMethod<Interaction>>();

    const prototype = o.prototype;
    const propertyNames = Object.getOwnPropertyNames(prototype);
    for (const propertyName of propertyNames) {
      const metadata = Reflect.getMetadata("discord:interaction", prototype, propertyName)
      if (!metadata) {
        continue;
      }

      const descriptor = Reflect.getOwnPropertyDescriptor(prototype, propertyName);
      if (!descriptor) {
        continue;
      }

      this.callbackFns.set(metadata, descriptor.value);
    }
  }

  public contain(key: string): boolean {
    return this.callbackFns.has(key);
  }

  public async call(key: string, interaction: Interaction) {
    const callbackFn = this.callbackFns.get(key);
    if (!callbackFn) {
      console.error(`${key} callback method not exist`);
      return;
    }
    await callbackFn(interaction);
  }
}

export function CommandData(data: RESTPostAPIApplicationCommandsJSONBody): ClassDecorator {
  return <T extends Function>(constructor: T) => {
    Reflect.defineMetadata("discord:command", data, constructor.prototype);
  }
}

export function InteractionHandler(): ClassDecorator {
  return <T extends Function>(constructor: T) => {
    Reflect.defineMetadata("discord:interaction", new InteractionCallbackManager(constructor), constructor.prototype);
  }
}

export function AddExecute(key: string): InteractionCallbackMethodDecorator {
  return <T extends Interaction>(
    target: Object,
    propertyKey: string,
    _descriptor: InteractionCallbackPropertyDescriptor<T>
  ) => {
    Reflect.defineMetadata("discord:interaction", key, target, propertyKey);
  }
}
