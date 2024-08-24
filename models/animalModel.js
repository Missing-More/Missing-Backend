const mysql = require('mysql');
const dbConfig = require('../config/db');

// Create a connection to the database
const connection = mysql.createConnection(dbConfig);

// Connect to the database
connection.connect(error => {
    if (error) throw error;
    console.log("Successfully connected to the database.");
});

// Animal model
class Animal {
    constructor(id, name, species, age) {
        this.id = id;
        this.name = name;
        this.species = species;
        this.age = age;
    }

    static create(newAnimal, result) {
        connection.query("INSERT INTO animals SET ?", newAnimal, (error, res) => {
            if (error) {
                console.log("error: ", error);
                result(error, null);
                return;
            }

            console.log("created animal: ", { id: res.insertId, ...newAnimal });
            result(null, { id: res.insertId, ...newAnimal });
        });
    }

    static findById(animalId, result) {
        connection.query(`SELECT * FROM animals WHERE id = ${animalId}`, (error, res) => {
            if (error) {
                console.log("error: ", error);
                result(error, null);
                return;
            }

            if (res.length) {
                console.log("found animal: ", res[0]);
                result(null, res[0]);
                return;
            }

            // not found Animal with the id
            result({ kind: "not_found" }, null);
        });
    }

    static getAll(result) {
        connection.query("SELECT * FROM animals", (error, res) => {
            if (error) {
                console.log("error: ", error);
                result(null, error);
                return;
            }

            console.log("animals: ", res);
            result(null, res);
        });
    }

    static updateById(id, animal, result) {
        connection.query(
            "UPDATE animals SET name = ?, species = ?, age = ? WHERE id = ?",
            [animal.name, animal.species, animal.age, id],
            (error, res) => {
                if (error) {
                    console.log("error: ", error);
                    result(null, error);
                    return;
                }

                if (res.affectedRows == 0) {
                    // not found Animal with the id
                    result({ kind: "not_found" }, null);
                    return;
                }

                console.log("updated animal: ", { id: id, ...animal });
                result(null, { id: id, ...animal });
            }
        );
    }

    static remove(id, result) {
        connection.query("DELETE FROM animals WHERE id = ?", id, (error, res) => {
            if (error) {
                console.log("error: ", error);
                result(null, error);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Animal with the id
                result({ kind: "not_found" }, null);
                return;
            }

            console.log("deleted animal with id: ", id);
            result(null, res);
        });
    }

    static removeAll(result) {
        connection.query("DELETE FROM animals", (error, res) => {
            if (error) {
                console.log("error: ", error);
                result(null, error);
                return;
            }

            console.log(`deleted ${res.affectedRows} animals`);
            result(null, res);
        });
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
    }

    getSpecies() {
        return this.species;
    }

    setSpecies(species) {
        this.species = species;
    }

    getAge() {
        return this.age;
    }

    setAge(age) {
        this.age = age;
    }

    displayDetails() {
        return `Name: ${this.name}, Species: ${this.species}, Age: ${this.age}`;
    }
}

module.exports = Animal;