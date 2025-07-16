import { updateDOM } from './render.js';

export const reactive = function(obj){
  return new Proxy(obj, {
    set(target, key, value){
      target[key] = value; // target is obj
      // updateDOM();
      return true;
    }

  })
}