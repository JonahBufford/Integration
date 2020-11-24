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
    let isbnFailMessage = "ISBN is incorrect length";
    if(newBook.ISBN){
        let numberCount = 0;
        let dashCount = 0;
        let numbers = [];
        let isbn = newBook.ISBN;
        if(isbn.length == 17){
            for(let i = 0; i < 17; i++){
                let thisChar = isbn[i];
                if(thisChar >= '0' && thisChar <= '9'){
                    numbers[numberCount] = parseInt(thisChar);
                    numberCount++;
                }
                else if (thisChar == '-'){
                    dashCount++;
                }
                else{
                    isbnFailMessage = "Invalid character in ISBN";
                }
            }
            if(numberCount == 13 && dashCount == 4){
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
                else{
                    isbnFailMessage = "ISBN sum incorrect: " + sum;
                }
            }
        }
        else if(isbn.length == 13){
            for(let i = 0; i < 13; i++){
                let thisChar = isbn[i];
                if(thisChar >= '0' && thisChar <= '9'){
                    numbers[numberCount] = parseInt(thisChar);
                    numberCount++;
                }
                else if (thisChar == '-'){
                    dashCount++;
                }
                else{
                    isbnFailMessage = "Invalid character in ISBN";
                }
            }
            if(numberCount == 10 && dashCount == 3){
                let sum = 0;
                for(let i = 0; i < 10; i++){
                    sum += (10 - i)*numbers[i];
                }
                if(sum%11 == 0){
                    isbnValid = true;
                }
                else{
                    isbnFailMessage = "ISBN sum incorrect: "  + sum;
                }
            }
        }
    }
    if (!newBook.name || !newBook.author || !newBook.price || !newBook.ISBN){
        HandleError(response, 'Missing Info', 'Form data missing', 500);
    }
    else if(!isbnValid){
        HandleError(response, 'Invalid ISBN', isbnFailMessage, 500);
    }
    else{
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

router.get('/', (request, response, next) => {
    let author = request.query['author'];
    if (author){
        BookSchema
            .find({"author": author})
            .exec( (error, books) => {
                if (error){
                    response.send({"error": error});
                }else{
                    response.send(books);
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
            if (result){
                response.send(result);
            }else{
                response.status(404).send({"id": request.params.isbn, "error":  "Not Found"});
            }

        });
});

router.patch('/:isbn', (request, response, next) =>{
    BookSchema
        .findOne({"ISBN": request.params.isbn}, (error, result)=>{
            if (error) {
                console.log(error);
                response.status(500).send(error);
            }else if (result){
                for (let field in request.body){
                    result[field] = request.body[field];
                }
                result.save((error, friend)=>{
                    if (error){
                        console.log("save error");
                        response.status(500).send(error);
                    }
                    response.send(friend);
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
            }else if (result){
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


module.exports = router;