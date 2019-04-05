/* eslint-env mocha */

import { NonRestorablePerson, Person } from "./classes";
import {
  update,
  updateAndRestore,
  updateProp,
  updatePropAndRestore,
} from "../src/updater";

import { $bind } from "@sp2/format";
import assert from "assert";

describe("update() can immutably update objects using", () => {
  describe("no operators,", () => {
    it("parses them as $set operation", () => {
      const obj = { name: { first: "Shin", last: "Doe" } };
      const params = { "name.first": "John", age: 32 };
      const updatedObject = update(obj, params);
      assert.deepStrictEqual(updatedObject, {
        name: { first: "John", last: "Doe" },
        age: 32,
      });
    });
  });

  describe("$set operator,", () => {
    it("sets given values to the position designed by docPath", () => {
      const obj = { name: { first: "Shin", last: "Doe" } };
      const operation = { $set: { "name.first": "John", age: 32 } };

      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        name: { first: "John", last: "Doe" },
        age: 32,
      });
    });

    it("sets given values to the position in array", () => {
      const room = { members: [{ name: { first: "Shin", last: "Doe" } }] };
      const operation = { $set: { "members[0].name.first": "John" } };

      const updatedObject = update(room, operation);
      assert.deepStrictEqual(updatedObject, {
        members: [
          {
            name: { first: "John", last: "Doe" },
          },
        ],
      });
    });

    it("can accept operations generated by $bind() function", () => {
      const obj = { name: { first: "Shin", last: "Doe" } };

      type Person = { name: { first: string; last: string }; age: number };
      const { $set, $docPath, $merge } = $bind<Person>();
      const operation = $merge(
        $set($docPath("name", "first"), "John"),
        $set($docPath("age"), 32)
      );

      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        name: { first: "John", last: "Doe" },
        age: 32,
      });
    });
  });

  describe("$inc operator,", () => {
    it("increments given values to the position designed by docPath", () => {
      const obj = { visited: { type: "house", count: 32 } };
      const operation = { $inc: { "visited.count": 4 } };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        visited: { type: "house", count: 36 },
      });
    });

    it("sets given values to the position when it doesn't exist", () => {
      const obj = { foo: { bar: 123 } };
      const operation = { $inc: { "foo.bar": 10, "baz.biz": 50 } };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        foo: { bar: 133 },
        baz: { biz: 50 },
      });
    });

    it("can accept operations generated by $bind() function", () => {
      const obj = { visited: { type: "house", count: 32 } };

      type Data = { visited: { type: string; count: number } };
      const { $inc, $docPath } = $bind<Data>();
      const operation = $inc($docPath("visited", "count"), 4);

      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        visited: { type: "house", count: 36 },
      });
    });
  });

  describe("$min operator,", () => {
    it("sets the smaller value between current and given values", () => {
      const obj = { physical: { height: 168.3 } };
      const operation = { $min: { "physical.height": 168.29 } };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        physical: { height: 168.29 },
      });
    });

    it("can accept operations generated by $bind() function", () => {
      const obj = { physical: { height: 168.3 } };
      type Person = { physical: { height: number } };
      const { $min, $docPath } = $bind<Person>();
      const operation = $min($docPath("physical", "height"), 168.32);

      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        physical: { height: 168.3 },
      });
    });

    it("sets the smaller value (string) between current and given values", () => {
      const obj = { name: { first: "Shin" } };
      const operation = { $min: { "name.first": "John" } };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        name: { first: "John" },
      });
    });

    it("can accept operations generated by $bind() function when prop is string", () => {
      const obj = { name: { first: "John" } };
      type Person = { name: { first: string } };
      const { $min, $docPath } = $bind<Person>();
      const operation = $min($docPath("name", "first"), "Shin");

      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        name: { first: "John" },
      });
    });
  });

  describe("$max operator,", () => {
    it("sets the largest value between current and given values", () => {
      const obj = { physical: { height: 168.3 } };
      const operation = { $max: { "physical.height": 168.29 } };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        physical: { height: 168.3 },
      });
    });

    it("can accept operations generated by $bind() function", () => {
      const obj = { physical: { height: 168.3 } };
      type Person = { physical: { height: number } };
      const { $max, $docPath } = $bind<Person>();
      const operation = $max($docPath("physical", "height"), 168.32);

      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        physical: { height: 168.32 },
      });
    });

    it("sets the largest value (string) between current and given values", () => {
      const obj = { name: { first: "Shin" } };
      const operation = { $max: { "name.first": "John" } };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        name: { first: "Shin" },
      });
    });

    it("can accept operations generated by $bind() function when prop is string", () => {
      const obj = { name: { first: "John" } };
      type Person = { name: { first: string } };
      const { $max, $docPath } = $bind<Person>();
      const operation = $max($docPath("name", "first"), "Shin");

      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        name: { first: "Shin" },
      });
    });
  });

  describe("$mul operator,", () => {
    it("multiples given values to the position designed by docPath", () => {
      const obj = { current: { rate: 1.3 } };
      const operation = { $mul: { "current.rate": 2.5 } };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        current: { rate: 3.25 },
      });
    });

    it("returns 0 when the given position is empty", () => {
      const obj = { current: { rate: null } };
      const operation = { $mul: { "current.rate": 2.5 } };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        current: { rate: 0 },
      });
    });

    it("can accept operations generated by $bind() function", () => {
      const obj = { current: { rate: 1.3 } };

      type Data = { current: { rate: number } };
      const { $mul, $docPath } = $bind<Data>();
      const operation = $mul($docPath("current", "rate"), 0);

      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        current: { rate: 0 },
      });
    });
  });

  describe("$addToSet operator,", () => {
    it("add values to the position designed by docPath", () => {
      const obj = { gameCompanies: { hardware: ["Sony", "Microsoft"] } };
      const operation = { $addToSet: { "gameCompanies.hardware": "Nintendo" } };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        gameCompanies: { hardware: ["Sony", "Microsoft", "Nintendo"] },
      });
    });

    it("add a new array to the position when it's null", () => {
      const obj = { gameCompanies: { hardware: null } };
      const operation = {
        $addToSet: {
          "gameCompanies.hardware": { $each: ["Nintendo", "Microsoft"] },
        },
      };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        gameCompanies: { hardware: ["Nintendo", "Microsoft"] },
      });
    });

    it("throws an error when non-array prop is designated", () => {
      const obj = { foo: "bar" };
      const operation = {
        $addToSet: { foo: "baz" },
      };
      assert.throws(
        () => update(obj, operation),
        /"\$addToSet" operator must be applied to an array/
      );
    });

    it("can accept operations generated by $bind() function", () => {
      const obj = { gameCompanies: { hardware: ["Sony", "Microsoft"] } };
      type Data = { gameCompanies: { hardware: string[] } };
      const { $addToSet, $docPath } = $bind<Data>();
      const operation = $addToSet(
        $docPath("gameCompanies", "hardware"),
        "Nintendo"
      );

      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        gameCompanies: { hardware: ["Sony", "Microsoft", "Nintendo"] },
      });
    });

    it("can accept operations with multiple values", () => {
      const obj = { gameCompanies: { hardware: ["Sony", "Microsoft"] } };
      type Data = { gameCompanies: { hardware: string[] } };
      const { $addToSet, $docPath } = $bind<Data>();
      const operation = $addToSet($docPath("gameCompanies", "hardware"), {
        $each: ["Nintendo", "Sony", "SEGA"],
      });

      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        gameCompanies: { hardware: ["Sony", "Microsoft", "Nintendo", "SEGA"] },
      });
    });
  });

  describe("$pop operator,", () => {
    it("pop values when 1 is given", () => {
      const obj = { gameCompanies: { hardware: ["Sony", "Microsoft"] } };
      const operation = { $pop: { "gameCompanies.hardware": 1 as 1 } };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        gameCompanies: { hardware: ["Sony"] },
      });
    });

    it("shift values when -1 is given", () => {
      const obj = { gameCompanies: { hardware: ["Sony", "Microsoft"] } };
      const operation = { $pop: { "gameCompanies.hardware": -1 } };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        gameCompanies: { hardware: ["Microsoft"] },
      });
    });

    it("can accept operations generated by $bind() function", () => {
      const obj = { gameCompanies: { hardware: ["Sony", "Microsoft"] } };
      type Data = { gameCompanies: { hardware: string[] } };
      const { $pop, $docPath } = $bind<Data>();
      const operation = $pop($docPath("gameCompanies", "hardware"), 1);
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        gameCompanies: {
          hardware: ["Sony"],
        },
      });
    });
  });

  describe("$pull operator,", () => {
    const obj = {
      langs: [
        { type: "LL", name: "JavaScript" },
        { type: "Compile", name: "Go" },
        { type: "Compile", name: "C++" },
        { type: "Compile", name: "Java" },
        { type: "LL", name: "python" },
        { type: "LL", name: "PHP" },
        { type: "LL", name: "Ruby" },
      ],
    };

    it("removes values by given QueryCondition", () => {
      const operation = { $pull: { langs: { type: "Compile" } } };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        langs: [
          { type: "LL", name: "JavaScript" },
          { type: "LL", name: "python" },
          { type: "LL", name: "PHP" },
          { type: "LL", name: "Ruby" },
        ],
      });
    });

    it("can accept operations generated by $bind() function", () => {
      type Lang = { type: "LL" | "Compile"; name: string };
      type Data = { langs: Lang[]; foo: any[] };
      const { $pull, $docPath } = $bind<Data>();
      const operation = $pull($docPath("langs"), { name: { $regex: /Java/ } });
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        langs: [
          { type: "Compile", name: "Go" },
          { type: "Compile", name: "C++" },
          { type: "LL", name: "python" },
          { type: "LL", name: "PHP" },
          { type: "LL", name: "Ruby" },
        ],
      });
    });
  });

  describe("$push operator,", () => {
    it("add values to the position designed by docPath", () => {
      const obj = { gameCompanies: { hardware: ["Sony", "Microsoft"] } };
      const operation = { $push: { "gameCompanies.hardware": "Nintendo" } };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        gameCompanies: { hardware: ["Sony", "Microsoft", "Nintendo"] },
      });
    });

    it("add values just after the given position when $position operator is given", () => {
      const obj = { gameCompanies: { hardware: ["Sony", "Microsoft"] } };
      const operation = {
        $push: {
          "gameCompanies.hardware": { $each: ["Nintendo"], $position: 1 },
        },
      };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        gameCompanies: { hardware: ["Sony", "Nintendo", "Microsoft"] },
      });
    });

    it("slices values from the end after insertion when $slice operator is given and it's a positive value", () => {
      const obj = { gameCompanies: { hardware: ["Sony", "Microsoft"] } };
      const operation = {
        $push: {
          "gameCompanies.hardware": { $each: ["Nintendo"], $slice: 2 },
        },
      };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        gameCompanies: { hardware: ["Sony", "Microsoft"] },
      });
    });

    it("slices values from the start after insertion when $slice operator is given and it's a negative value", () => {
      const obj = { gameCompanies: { hardware: ["Sony", "Microsoft"] } };
      const operation = {
        $push: {
          "gameCompanies.hardware": { $each: ["Nintendo"], $slice: -2 },
        },
      };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        gameCompanies: { hardware: ["Microsoft", "Nintendo"] },
      });
    });

    it("sorts values after insertion when $sort operator is given", () => {
      const obj = { gameCompanies: { hardware: ["Sony", "Microsoft"] } };
      const operation = {
        $push: {
          "gameCompanies.hardware": { $each: ["Nintendo"], $sort: 1 },
        },
      };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        gameCompanies: { hardware: ["Microsoft", "Nintendo", "Sony"] },
      });
    });

    it("can accept operations generated by $bind() function", () => {
      const obj = { gameCompanies: { hardware: ["Sony", "Microsoft"] } };
      type Data = { gameCompanies: { hardware: string[] } };
      const { $push, $docPath } = $bind<Data>();
      const operation = $push(
        $docPath("gameCompanies", "hardware"),
        "Nintendo"
      );

      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        gameCompanies: { hardware: ["Sony", "Microsoft", "Nintendo"] },
      });
    });

    it("can accept operations with multiple values", () => {
      const obj = { gameCompanies: { hardware: ["Sony", "Microsoft"] } };
      type Data = { gameCompanies: { hardware: string[] } };
      const { $push, $docPath } = $bind<Data>();
      const operation = $push($docPath("gameCompanies", "hardware"), {
        $each: ["Nintendo", "Sony", "SEGA"],
      });

      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        gameCompanies: {
          hardware: ["Sony", "Microsoft", "Nintendo", "Sony", "SEGA"],
        },
      });
    });
  });

  describe("$currentDate operator,", () => {
    it("sets current date to the position designed by docPath", () => {
      const obj = { physical: { height: 168.3 } };
      const operation = {
        $set: { "physical.height": 168.5 },
        $currentDate: { "physical.measuredAt": { $type: "timestamp" } },
      };
      const updatedObject = update(obj, operation);
      // @ts-ignore
      const measuredAt = updatedObject.physical.measuredAt;
      assert.deepStrictEqual(updatedObject, {
        physical: {
          height: 168.5,
          measuredAt,
        },
      });
      assert(typeof measuredAt === "number");
    });

    it("can accept operations generated by $bind() function", () => {
      const obj = { physical: { height: 168.3 } };
      type Person = { physical: { height: number; measuredAt: string } };
      const { $currentDate, $docPath } = $bind<Person>();
      const operation = $currentDate($docPath("physical", "measuredAt"), true);

      const updatedObject = update(obj, operation);
      // @ts-ignore
      const measuredAt = updatedObject.physical.measuredAt;
      assert.deepStrictEqual(updatedObject, {
        physical: { height: 168.3, measuredAt: measuredAt },
      });
      assert(measuredAt instanceof Date);
    });
  });

  describe("$bit operator,", () => {
    it("sets values calculated by bit operand", () => {
      const obj = { info: { flags: parseInt("01001001", 2) } };
      const operation = {
        $bit: { "info.flags": { xor: parseInt("10001010", 2) } },
      };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        info: { flags: parseInt("11000011", 2) },
      });
    });

    it("sets values to an empty prop", () => {
      const obj = { info: { flags: undefined } };
      const operation = {
        $bit: { "info.flags": { or: parseInt("10001111", 2) } },
      };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        info: { flags: parseInt("10001111", 2) },
      });
    });

    it("does nothing when an empty operation is given", () => {
      const obj = { info: { flags: undefined } };
      const operation = {
        $bit: { "info.flags": {} },
      };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        info: { flags: undefined },
      });
    });

    it("can accept operations generated by $bind() function", () => {
      const obj = { info: { flags: parseInt("01001001", 2) } };
      type Data = { info: { flags: number } };
      const { $bit, $docPath } = $bind<Data>();
      const operation = $bit($docPath("info", "flags"), {
        and: parseInt("11110000", 2),
      });

      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        info: { flags: parseInt("01000000", 2) },
      });
    });
  });

  describe("$unset operator,", () => {
    it("unsets a value of the position designed by docPath", () => {
      const obj = { physical: { height: 168.3 } };
      const operation = {
        $unset: { "physical.height": "" },
      };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        physical: {},
      });
    });

    it("unsets a value of the shallowest position", () => {
      const obj = { physical: { height: 168.3 } };
      const operation = {
        $unset: { physical: "" },
      };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {});
    });

    it("unsets a value in an array", () => {
      const obj = { values: [1, 2, 3] };
      const operation = {
        $unset: { "values[1]": "" },
      };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, { values: [1, undefined, 3] });
    });

    it("does nothing when the position designed by docPath doesn't exist", () => {
      const obj = { foo: { bar: 1 } };
      const operation = {
        $unset: { "hoge.fuga": "" },
      };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, obj);
    });

    it("can accept operations generated by $bind() function", () => {
      const obj = { physical: { height: 168.3 } };
      type Person = { physical: { height?: number } };
      const { $unset, $docPath } = $bind<Person>();
      const operation = $unset($docPath("physical", "height"), "");

      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        physical: {},
      });
    });
  });

  describe("$rename operator,", () => {
    it("renames props", () => {
      const obj = { foo: { bra: "baz" } };
      const operation = {
        $rename: { "foo.bra": "bar" },
      };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        foo: { bar: "baz" },
      });
    });

    it("renames a prop of the shallowest position", () => {
      const obj = { phisical: { height: 168.3 } };
      const operation = {
        $rename: { phisical: "physical" },
      };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, { physical: { height: 168.3 } });
    });

    it("throws an error when an element in array is designated", () => {
      const obj = { vlues: ["foo", "bar"] };
      const operation = {
        $rename: { "vlues[0]": "1" },
      };
      assert.throws(
        () => update(obj, operation),
        /\$rename operation cannot be applied to element in array/
      );
    });

    it("does nothing when the position designed by docPath doesn't exist", () => {
      const obj = { foo: { bar: 1 } };
      const operation = {
        $rename: { "hoge.fuga": "xx" },
      };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, obj);
    });

    it("can accept operations generated by $bind() function", () => {
      const obj = { foo: { bra: "baz" } };
      type Data = { foo: { bra: string } };
      const { $rename, $docPath } = $bind<Data>();
      const operation = $rename($docPath("foo", "bra"), "bar");

      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        foo: { bar: "baz" },
      });
    });
  });

  describe("$restore operator,", () => {
    it("can restore a new instance of the position designed by docPath when the class is restorable", () => {
      const plainPerson = {
        name: { first: "Smith", last: "Doe" },
        birthday: "1986-02-10",
      };
      const book = { name: "phenyl sp2", author: plainPerson };

      const operation = {
        $restore: { author: Person },
      };
      const updatedBook = update(book, operation);
      assert.deepStrictEqual(updatedBook, {
        name: "phenyl sp2",
        author: new Person({
          name: { first: "Smith", last: "Doe" },
          birthday: "1986-02-10",
        }),
      });
    });

    it("cannot restore a new instance when the class is not restorable", () => {
      const plainPerson = {
        name: { first: "Smith", last: "Doe" },
        birthday: "1986-02-10",
      };
      const book = { name: "phenyl sp2", author: plainPerson };

      const operation = {
        $restore: { author: NonRestorablePerson },
      };
      // @ts-ignore NonRestorable
      const updatedBook = update(book, operation);
      assert.notDeepStrictEqual(updatedBook, {
        name: "phenyl sp2",
        author: new Person({
          name: { first: "Smith", last: "Doe" },
          birthday: "1986-02-10",
        }),
      });
    });

    it("passes through the original prop when it is a primitive value", () => {
      const book = { name: "phenyl sp2", author: "Shin Suzuki" };

      const operation = {
        $restore: { author: Person },
      };
      const updatedBook = update(book, operation);
      assert.deepStrictEqual(updatedBook, {
        name: "phenyl sp2",
        author: "Shin Suzuki",
      });
    });

    it("can restore a new instance when the class is not given and original prop is already an instance", () => {
      const plainPerson = new Person({
        name: { first: "Smith", last: "Doe" },
        birthday: "1986-02-10",
      });
      const book = { name: "phenyl sp2", author: plainPerson };

      const operation = {
        $set: { "name.first": "John" },
        $restore: { author: "" },
      };
      // @ts-ignore NonRestorable
      const updatedBook = update(book, operation);
      assert.notDeepStrictEqual(updatedBook, {
        name: "phenyl sp2",
        author: new Person({
          name: { first: "John", last: "Doe" },
          birthday: "1986-02-10",
        }),
      });
    });
  });
  describe("$append operator,", () => {
    it("appends a given object to an existing value", () => {
      const obj = { foo: { bar: { biz: true, bra: "baz" } } };
      const operation = {
        $append: { "foo.bar": { abc: 123, bra: null } },
      };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        foo: { bar: { biz: true, abc: 123, bra: null } },
      });
    });

    it("sets a given object when the position designed by docPath doesn't exist", () => {
      const obj = { foo: null };
      const operation = {
        $append: { "foo.bar": { abc: 123, bra: null } },
      };
      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        foo: { bar: { abc: 123, bra: null } },
      });
    });

    it("can accept operations generated by $bind() function", () => {
      const obj = { foo: { bar: { biz: true, bra: "baz" } } };
      type Data = {
        foo: { bar: { biz: boolean; bra: string | null; abc?: number } };
      };
      const { $append, $docPath } = $bind<Data>();
      const operation = $append($docPath("foo", "bar"), {
        abc: 123,
        bra: null,
      });

      const updatedObject = update(obj, operation);
      assert.deepStrictEqual(updatedObject, {
        foo: { bar: { biz: true, abc: 123, bra: null } },
      });
    });
  });
});

describe("updateProp()", () => {
  it("returns a new object with new property updated following given UpdateOperation", () => {
    const person = { name: { first: "Shin", last: "Doe" } };
    const book = {
      name: "Phenyl sp2",
      meta: {
        author: person,
      },
    };

    const operation = { $set: { "name.last": "Suzuki" } };

    const newBook = updateProp(book, "meta.author", operation);
    assert.deepStrictEqual(newBook, {
      name: "Phenyl sp2",
      meta: {
        author: { name: { first: "Shin", last: "Suzuki" } },
      },
    });
    assert.notEqual(book, newBook);
    assert.notEqual(person, newBook.meta.author);
  });
});

describe("updateAndRestore()", () => {
  it("can create a new instance with updated properties following given UpdateOperation when the class is restorable", () => {
    const person = new Person({
      name: { first: "Smith", last: "Doe" },
      birthday: "1986-02-10",
    });

    const operation = { $set: { "name.first": "John" } };

    const newPerson = updateAndRestore(person, operation);
    assert(newPerson instanceof Person);
    assert.deepStrictEqual(
      newPerson,
      new Person({
        name: { first: "John", last: "Doe" },
        birthday: new Date("1986-02-10"),
      })
    );
  });

  it("can create a new instance with updated date when the class is restorable", () => {
    const person = new Person({
      name: { first: "Smith", last: "Doe" },
      birthday: "1986-02-10",
    });

    const operation = { $set: { birthday: "1986-03-10" } };

    const newPerson = updateAndRestore(person, operation);
    assert(newPerson instanceof Person);
    assert.deepStrictEqual(
      newPerson,
      new Person({
        name: { first: "Smith", last: "Doe" },
        birthday: new Date("1986-03-10"),
      })
    );
  });

  it("cannot create a valid instance when the class is not restorable", () => {
    const person = new NonRestorablePerson(
      { first: "Smith", last: "Doe" },
      "1986-02-10"
    );
    const operation = { $set: { "name.first": "John" } };
    const newPerson = updateAndRestore(person, operation);
    assert(newPerson instanceof NonRestorablePerson);
    assert.notDeepStrictEqual(
      newPerson,
      new NonRestorablePerson(
        { first: "John", last: "Doe" },
        new Date("1986-02-10")
      )
    );
  });
});

describe("updatePropAndRestore()", () => {
  it("can create a new instance with updated properties following given UpdateOperation when the class is restorable", () => {
    const person = new Person({
      name: { first: "Smith", last: "Doe" },
      birthday: "1986-02-10",
    });

    const operation = { $set: { first: "John" } };

    const newPerson = updatePropAndRestore(person, "name", operation);
    assert(newPerson instanceof Person);
    assert.deepStrictEqual(
      newPerson,
      new Person({
        name: { first: "John", last: "Doe" },
        birthday: new Date("1986-02-10"),
      })
    );
  });

  it("cannot create a valid instance when the class is not restorable", () => {
    const person = new NonRestorablePerson(
      { first: "Smith", last: "Doe" },
      "1986-02-10"
    );

    const operation = { $set: { first: "John" } };

    const newPerson = updatePropAndRestore(person, "name", operation);
    assert(newPerson instanceof NonRestorablePerson);
    assert.notDeepStrictEqual(
      newPerson,
      new NonRestorablePerson(
        { first: "John", last: "Doe" },
        new Date("1986-02-10")
      )
    );
  });
});
