const http = require('http')
const fs = require('fs')
const ws = require('ws')

console.log('Starting server...')

const readFile = file => new Promise(resolve => fs.readFile(file, 'utf-8', (_, data) => resolve(data)))

const server = http.createServer(async (req, resp) => {
    if (req.url === '/'){
        resp.end(await readFile('start.html'))
    }
    else if (req.url === '/vue.js'){
        resp.end(await readFile('vue.js'))
    }
    else if (req.url === '/client.js'){
        resp.end(await readFile('client.js'))
    }
    else{
        resp.end()
    }
}).listen(5000)

let first;
let counter = 0
stores_clients = {}

new ws.Server({server}).on('connection', client => {
    console.log("Connected in WS")

    client.on('message', msg => {
        let messageArray  = JSON.parse(msg);
        if(messageArray.msg === 'Start Game') {
            if(first)
            {
                console.log('Second Player Connected')
                first.send(JSON.stringify({
                    msg: 'Ok',
                    player_id: 0,
                    turn: 0,
                    my_char: "X",
                    opp_char: "O",
                    game_play: true
                }))

                client.send(JSON.stringify({
                    msg: 'Ok',
                    player_id: 1,
                    turn: 1,
                    my_char: "O",
                    opp_char: "X",
                    game_play: true
                }))

                stores_clients = {
                    A: first, 
                    B: client
                }
            }
            else
            {
                first = client
                console.log('First Player Connected')
                let game_play = messageArray.game_play
                if (game_play === false){
                    first.send(JSON.stringify({
                        msg: 'Wait Please',				
                    }));    
                }
            }
        }
        else if (messageArray.msg === "Update Grid"){
            let new_col = messageArray.col
            if(stores_clients.A  === client) {
                stores_clients.A.send(JSON.stringify({
                    msg: 'Matrix Updated',
                    col: new_col,
                    turn: 0,
                }))

                stores_clients.B.send(JSON.stringify({
                    msg: 'Matrix Updated',
                    col: new_col,
                    turn: 1,
                }))
            }
            
            else {
                stores_clients.B.send(JSON.stringify({
                    msg: 'Matrix Updated',
                    col: new_col,
                    turn: 0,
                }))

                stores_clients.A.send(JSON.stringify({
                    msg: 'Matrix Updated',
                    col: new_col,
                    turn: 1,
                }))
            }
        }
        else if (messageArray.msg === "Game Ended") {
            if(stores_clients.B  === client) {
                stores_clients.A.send(JSON.stringify({
                    msg: 'Winner',
                    new_msg: "You Lost"
                }))

                stores_clients.B.send(JSON.stringify({
                    msg: 'Winner',
                    new_msg: "You Won"
                }))
            }
            else {
                stores_clients.B.send(JSON.stringify({
                    msg: 'Winner',
                    new_msg: "You Lost"
                }))

                stores_clients.A.send(JSON.stringify({
                    msg: 'Winner',
                    new_msg: "You Won"
                }))
            }
        }
    })
})
