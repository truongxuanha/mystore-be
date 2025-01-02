const person = {
  name: "Alice",
  greet: function () {
    console.log(`Hello, my name is ${this.name}`);
  }
};

const greetAlice = person.greet();
greetAlice(); // "Hello, my name is Alice"
