
# sp2
[![CircleCI](https://circleci.com/gh/phenyl-js/sp2/tree/master.svg?style=svg)](https://circleci.com/gh/phenyl-js/sp2/tree/master)

`sp2` is a set of JavaScript modules using syntax for **State-operating Procedures with Portability**.
Portability means that procedures are expressed by JSON data. This makes procedures portable and applicable over different environments.

This concept of "portable operation" is inspired by MongoDB. In fact, sp2 uses similar syntaxes as MongoDB's operations in its modules.

## @sp2/updater

`@sp2/updater` is an immutable updater of POJO using MongoDB's operator, with easier access to nested values.

### Simple usage
```js
import { update } from "@sp2/updater";

const person = {
  name: { first: "Smith", last: "Doe" },
  age: 32
};

const operation = { $set: { "name.first": "John" } };

const updatedPerson = update(person, operation);
updatedPerson.name.first; // John

assert(updatedPerson !== person); // obj is unchanged.
assert(updatedPerson.age === 32); // unchanged.
assert(updatedPerson.name.first === "John"); // updated.
assert(updatedPerson.name.last === "Doe"); // unchanged.

```

### More powerful types with TypeScript
First, define update operation with type of target object.

```ts
import { $bind, update } from "@sp2/updater";

// target object type
type Person = {
  name: { first: string; last: string };
  age: number;
};

const { $set, $path } = $bind<Person>(); // Inject the type and generate operation-creating functions.

const operation = $set($path("name", "first"), "John");
```

We are able to get the property names of the target object type during writing codes.
![demo01](https://user-images.githubusercontent.com/196333/51425391-e6e6e900-1c1e-11e9-8a23-bc3557f00ade.gif)

Then, update the operation.
```ts
const operation = $set($path("name", "first"), "John");

const updatedPerson = update(person, operation);

assert(operation = { $set: { "name.first": "John" } });
assert(updatedPerson !== person); // obj is unchanged.
assert(updatedPerson.age === 32); // unchanged.
assert(updatedPerson.name.first === "John"); // updated.
assert(updatedPerson.name.last === "Doe"); // unchanged.

`sp2/updater` can infer the return value of `update()` (`Person` type here).
```
![demo02](https://user-images.githubusercontent.com/196333/51425384-c028b280-1c1e-11e9-92b3-c5f24b322b9b.gif)


## @sp2/retriever
`@sp2/retriever` retrieves objects in an array using MongoDB-like Operations.

```js
import { retrieve } from "@sp2/retriever";

const objs = [{ name: "John" }, { name: "Naomi" }, { name: "Shin" }];

const retrievedObjs = retrieve(obj, { name: { $regex: /n$/ } });
assert.deepEqual(retrievedObjs, [{ name: "John" }, { name: "Shin" }]);
```

See more usages [here]().

## @sp2/format

`@sp2/format` provides type definitions of operations used by `sp2/updater` and `sp2/retriever`.
