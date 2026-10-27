// All teaching content lives here. To add a topic, add another entry to PYTHON_LAB_TOPICS.
// Tests: student code is run, then `code` is appended; printed output after the marker must equal `expect`.
const PYTHON_LAB_TOPICS = {
oop: {
  id: 'oop', title: 'Object-Oriented Programming',
  intro: 'A class is a blueprint. An object is one thing built from it. Think of a cookie cutter (the class) and the cookies it makes (the objects). OOP keeps data and the actions on that data together.',
  objectives: ['Create classes and objects', 'Store data in attributes using __init__', 'Write methods that use self', 'Reuse code with inheritance', 'Protect data with encapsulation'],
  learn: [
    { title: 'Classes and objects', text: 'Write the blueprint once with <code>class</code>. Build as many objects as you like.',
      code: 'class Dog:\n    pass\n\nrex = Dog()\nmia = Dog()\nprint(type(rex))\nprint(rex is mia)',
      explain: '<code>Dog</code> is the blueprint. <code>rex</code> and <code>mia</code> are two separate objects, so <code>rex is mia</code> is False.' },
    { title: 'Attributes and __init__', text: 'An object remembers facts about itself in attributes. <code>__init__</code> runs automatically when you create the object.',
      code: 'class Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\nrex = Dog("Rex", 3)\nprint(rex.name, rex.age)',
      explain: '<code>self</code> means "this particular object". <code>self.name = name</code> saves the name inside it.' },
    { title: 'Methods', text: 'Methods are functions that belong to an object. They can read and change its attributes.',
      code: 'class Dog:\n    def __init__(self, name):\n        self.name = name\n        self.energy = 5\n\n    def play(self):\n        self.energy -= 2\n        return f"{self.name} plays! Energy: {self.energy}"\n\nrex = Dog("Rex")\nprint(rex.play())\nprint(rex.play())',
      explain: 'Each call changes <code>rex.energy</code>. The object remembers its state between calls.' },
    { title: 'Inheritance', text: 'A child class gets everything from its parent and can replace parts of it.',
      code: 'class Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        return "..."\n\nclass Cat(Animal):\n    def speak(self):\n        return "Meow"\n\nfor pet in [Animal("Generic"), Cat("Tom")]:\n    print(pet.name, pet.speak())',
      explain: '<code>Cat(Animal)</code> reuses <code>__init__</code> but overrides <code>speak</code>. The same call, <code>pet.speak()</code>, behaves differently for each object.' },
    { title: 'Encapsulation', text: 'Keep data behind methods so it can only change in safe ways. A leading underscore means "please do not touch directly".',
      code: 'class Wallet:\n    def __init__(self):\n        self._coins = 0\n    def add(self, n):\n        if n > 0:\n            self._coins += n\n    def total(self):\n        return self._coins\n\nw = Wallet()\nw.add(5)\nw.add(-3)\nprint(w.total())',
      explain: 'The method rejects bad input, so the wallet never holds a wrong amount.' }
  ],
  demo: 'objectFactory',
  exercises: [
    { id: 'ex1', level: 'Easy', title: 'Build a Dog', xp: 10, badge: { id: 'builder', icon: '🧱', name: 'Class Builder' }, skills: ['Defining a class', 'Writing a method that returns a value'],
      prompt: 'Create a <code>Dog</code> class. Each dog has a <code>name</code>. Its <code>speak()</code> method must <b>return</b> <code>"&lt;name&gt; says Woof!"</code>.',
      starter: '# Make a Dog class with a name and a speak() method\nclass Dog:\n    pass\n',
      hints: ['You need an __init__ method that takes self and name.', 'Save the name with self.name = name.', 'In speak, return an f-string that uses self.name.'],
      tests: [
        { name: 'Rex speaks', code: 'print(Dog("Rex").speak())', expect: 'Rex says Woof!' },
        { name: 'Another dog, another name', code: 'print(Dog("Mia").speak())', expect: 'Mia says Woof!' },
        { name: 'Stores name attribute', code: 'print(Dog("Zed").name)', expect: 'Zed' }] },
    { id: 'ex2', level: 'Medium', title: 'Car odometer', xp: 20, badge: { id: 'state', icon: '🚗', name: 'State Keeper' }, skills: ['Attributes with starting values', 'Changing object state', 'Validating input'],
      prompt: 'Finish the <code>Car</code> class. The odometer starts at 0. <code>drive(km)</code> adds distance, but ignores negative numbers.',
      starter: 'class Car:\n    def __init__(self, model):\n        self.model = model\n        # TODO: add an odometer that starts at 0\n\n    def drive(self, km):\n        # TODO: add km to the odometer (ignore negatives)\n        pass\n',
      hints: ['Add self.odometer = 0 inside __init__.', 'Inside drive, use self.odometer += km.', 'Wrap that line in if km > 0:.'],
      tests: [
        { name: 'New car starts at 0', code: 'print(Car("A").odometer)', expect: '0' },
        { name: 'Distances add up', code: 'c = Car("A")\nc.drive(10)\nc.drive(5)\nprint(c.odometer)', expect: '15' },
        { name: 'Negative distance ignored', code: 'c = Car("A")\nc.drive(10)\nc.drive(-5)\nprint(c.odometer)', expect: '10' },
        { name: 'Cars are independent', code: 'a = Car("A")\na.drive(7)\nb = Car("B")\nprint(b.odometer)', expect: '0' }] },
    { id: 'ex3', level: 'Hard', title: 'Animal family', xp: 30, badge: { id: 'inherit', icon: '🧬', name: 'Inheritor' }, skills: ['Inheritance', 'Overriding methods', 'Polymorphism'],
      prompt: 'Give <code>Animal</code> a <code>describe()</code> method that returns <code>"&lt;name&gt;: &lt;sound&gt;"</code> using <code>self.speak()</code>. Then make <code>Cat</code> inherit from <code>Animal</code> and say <code>"Meow"</code>.',
      starter: 'class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        return "..."\n\n    # TODO: add describe()\n\nclass Cat:  # TODO: inherit from Animal and override speak()\n    pass\n',
      hints: ['Write class Cat(Animal): so Cat inherits.', 'describe must call self.speak(), not hard-code the sound.', 'return f"{self.name}: {self.speak()}"'],
      tests: [
        { name: 'Plain animal', code: 'print(Animal("Generic").describe())', expect: 'Generic: ...' },
        { name: 'Cat meows', code: 'print(Cat("Tom").describe())', expect: 'Tom: Meow' },
        { name: 'Cat is an Animal', code: 'print(issubclass(Cat, Animal))', expect: 'True' },
        { name: 'describe uses speak()', code: 'class Dog(Animal):\n    def speak(self):\n        return "Woof"\nprint(Dog("Rex").describe())', expect: 'Rex: Woof' }] }
  ],
  project: { id: 'bank', level: 'Project', title: 'Bank Account Simulator', xp: 50, badge: { id: 'bank', icon: '🏦', name: 'Bank Manager' }, skills: ['Encapsulating data', 'Rules inside methods', 'Special method __str__'],
    prompt: 'Build a <code>BankAccount</code>. It takes an <code>owner</code> and optional starting <code>balance</code> (default 0). <code>deposit(amount)</code> and <code>withdraw(amount)</code> return True on success and False when the amount is not positive (or, for withdraw, more than the balance). <code>get_balance()</code> returns the balance. <code>print(account)</code> shows <code>"Ann: $20"</code>. Then use the Code tab to add your own features, such as <code>SavingsAccount</code> with interest.',
    starter: 'class BankAccount:\n    def __init__(self, owner, balance=0):\n        # TODO: store owner and balance (use self._balance)\n        pass\n\n    def deposit(self, amount):\n        # TODO: reject amounts <= 0, otherwise add and return True\n        pass\n\n    def withdraw(self, amount):\n        # TODO: reject bad or too-large amounts, otherwise subtract and return True\n        pass\n\n    def get_balance(self):\n        pass\n\n    def __str__(self):\n        # TODO: return "Ann: $20" style text\n        pass\n',
    hints: ['Store self.owner and self._balance in __init__.', 'deposit: if amount <= 0: return False. Otherwise add, then return True.', 'withdraw needs two checks: amount <= 0 and amount > self._balance.', '__str__ must return a string: f"{self.owner}: ${self._balance}"'],
    tests: [
      { name: 'Starts at zero', code: 'print(BankAccount("Ann").get_balance())', expect: '0' },
      { name: 'Deposit adds money', code: 'a = BankAccount("Ann", 100)\na.deposit(50)\nprint(a.get_balance())', expect: '150' },
      { name: 'Bad deposit rejected', code: 'a = BankAccount("Ann", 100)\nprint(a.deposit(-5), a.get_balance())', expect: 'False 100' },
      { name: 'Valid withdrawal', code: 'a = BankAccount("Ann", 100)\nprint(a.withdraw(30), a.get_balance())', expect: 'True 70' },
      { name: 'Overdraft blocked', code: 'a = BankAccount("Ann", 100)\nprint(a.withdraw(500), a.get_balance())', expect: 'False 100' },
      { name: 'Readable text', code: 'print(BankAccount("Ann", 20))', expect: 'Ann: $20' }] },
  freeStarter: '# Free playground. Try your own classes!\nclass Robot:\n    def __init__(self, name):\n        self.name = name\n\n    def greet(self):\n        print(f"Beep boop, I am {self.name}")\n\nRobot("R2").greet()\n',
  quiz: { xp: 20, badge: { id: 'scholar', icon: '🎓', name: 'OOP Scholar' }, pass: 2, questions: [
    { q: 'What is an object?', o: ['A blueprint for classes', 'A thing built from a class', 'A kind of loop', 'A Python file'], a: 1, why: 'A class is the blueprint. An object is one thing made from it.' },
    { q: 'Inside a method, what does self refer to?', o: ['The class itself', 'The Python interpreter', 'The object calling the method', 'The module'], a: 2, why: 'self is the specific object the method was called on.' },
    { q: 'What does class Cat(Animal) mean?', o: ['Cat inherits from Animal', 'Animal inherits from Cat', 'Cat deletes Animal', 'Cat is a function'], a: 0, why: 'The class in brackets is the parent. Cat gets its attributes and methods.' }] }
}};
