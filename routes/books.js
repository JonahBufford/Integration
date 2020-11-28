// Here we are going to code the API!!!!
// REST application
// Our API works over HTTP
// Using request from the HTTP verbs:
// - POST
// - GET
// - PATCH / PUT
// - DELETE

// For the routes
let express = require('express');
let router = express.Router();
// For the Data Model
let BookSchema = require('../models/books');


function HandleError(response, reason, message, code){
    console.log('ERROR: ' + reason);
    response.status(code || 500).json({"error:": message});
}

router.post('/', (request, response, next) => {
    let newBook = request.body;

    let isbnValid = false;
    let isbnUnique = true;
    BookSchema
        .find({"ISBN": newBook.ISBN}, (error, result) =>{
            console.log(result);
            console.log("it was called");
            if (JSON.stringify(result) != "[]"){
                isbnUnique = false;
            }
            if(newBook.ISBN){
                isbnValid = checkISBN(newBook.ISBN);
            }
            if (!newBook.name || !newBook.author || !newBook.price || !newBook.ISBN){
                console.log(newBook.name);
                console.log(newBook.author);
                console.log(newBook.price);
                console.log(newBook.ISBN);
                HandleError(response, 'Missing Info', 'Form data missing', 500);
            }
            else if(!isbnValid){
                HandleError(response, 'Invalid ISBN', isbnFailMessage, 500);
            }
            else if(!isbnUnique){
                HandleError(response, 'Repeat ISBN', "ISBN already exists in database", 500);
            }
            else{
                console.log("responding");
                response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
                let book = new BookSchema({
                    name: newBook.name,
                    author: newBook.author,
                    ISBN: newBook.ISBN,
                    price: newBook.price
                });
                book.save((error) => {
                    if (error){
                        response.send({"error": error});
                    }else{
                        response.send({"id": book.id});
                    }
                });
            }
        });
    console.log(isbnUnique);
    let isbnFailMessage = "ISBN is incorrect length";
    console.log(request.body);

});

router.get('/', (request, response, next) => {
    let author = request.query['author'];
    if (author){
        BookSchema
            .find({"author": author})
            .exec( (error, result) => {
                if (error){
                    response.send({"error": error});
                }
                if (result && JSON.stringify(result) != "[]"){
                    console.log(JSON.stringify(result));
                    response.send(result);
                }else{
                    response.status(404).send({"id": request.params.isbn, "error":  "Not Found"});
                }
            });
    }else{
        BookSchema
            .find()
            .exec( (error, books) => {
                if (error){
                    response.send({"error": error});
                }else{
                    response.send(books);
                }
            });
    }
    // FriendSchema
    //     .find()
    //     .exec( (error, friends) => {
    //         if (error){
    //             response.send({"error": error});
    //         }else{
    //             response.send(friends);
    //         }
    //     });
} );

router.get('/:isbn', (request, response, next) =>{
    BookSchema
        .find({"ISBN": request.params.isbn}, (error, result) =>{
            if (error) {
                response.status(500).send(error);
            }
            if (result && JSON.stringify(result) != "[]"){
                console.log(JSON.stringify(result));
                response.send(result);
            }else{
                response.status(404).send({"id": request.params.isbn, "error":  "Not Found"});
            }

        });
});

router.patch('/:isbn', (request, response, next) =>{
    BookSchema
        .findOne({"ISBN": request.params.isbn}, (error, result)=>{
            console.log("found");
            if (error) {
                console.log(error);
                response.status(500).send(error);
            }else if (result && JSON.stringify(result) != "[]"){
                console.log(result);
                for (let field in request.body){
                    console.log(field);
                    result[field] = request.body[field];
                    console.log(request.body[field]);
                }
                console.log(result);
                result.save((error, book)=>{
                    console.log(book);
                    if (error){
                        console.log("save error");
                        response.status(500).send(error);
                    }
                    response.send(book);
                });
            }else{
                response.status(404).send({"id": request.params.id, "error":  "Not Found"});
            }

        });
});

router.delete('/:isbn', (request, response, next) =>{
    BookSchema
        .findOne({"ISBN": request.params.isbn}, (error, result)=>{
            if (error) {
                console.log("error find");
                response.status(500).send(error);
            }else if (result && JSON.stringify(result) != "[]"){
                result.remove((error)=>{
                    if (error){
                        console.log("error remove");
                        response.status(500).send(error);
                    }
                    response.send({"deletedISBN": request.params.isbn});
                });
            }else{
                response.status(404).send({"isbn": request.params.isbn, "error":  "Not Found"});
            }
        });
});

function checkISBN(isbn){
    let isbnValid = false;
    let numberCount = 0;
    let dashCount = 0;
    let numbers = [];
    let allNumbers = true;
    console.log(isbn);
    let count = 0;
    for(let i = 0; i < isbn.length; i++){
        let thisChar = isbn[i];
        if(thisChar >= '0' && thisChar <= '9'){
            numbers[count] = parseInt(thisChar);
            count++;
        }
        else if(thisChar == '-'){
        }
        else{
            allNumbers = false;
        }
    }
    if(count == 13){
        if(allNumbers){
            let sum = 0;
            for(let i = 0; i < 13; i++){
                if(i%2 == 0){
                    sum += numbers[i];
                }
                else{
                    sum += 3*numbers[i];
                }
            }
            if(sum%10 == 0){
                isbnValid = true;
            }
        }
    }
    else if(count == 10){
        if(allNumbers){
            let sum = 0;
            for(let i = 0; i < 10; i++){
                sum += (10 - i)*numbers[i];
            }
            if(sum%11 == 0){
                isbnValid = true;
            }
        }
    }
    return isbnValid
}

module.exports = router;