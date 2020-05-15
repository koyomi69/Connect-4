new Vue({
    template:`    
    <div>
        <h1 align="center"> WELCOME TO CONNECT 4 </h1>
        <h3 align="center"> Click on NEW Game to Start </h3>
        <div align="center">
            <button v-on:click="gameStart">NEW GAME</button> 
        </div>
        <br>
        <table border=1 align="center">
            <tr v-for='row in arr'>
                <td v-for='(col, j) in row'>
                    <button :style="{padding: pad + 'px'}" v-on:click="doSomething(j)">{{ col }}</button>
                </td> 
            </tr>
        </table>
    </div>
    `,
    data: { 
        arr: Array(6).fill('').map(() => Array(7).fill('')),
        currentColor: 'blue',
        pad: 30,
        my_char: '',
        opp_char: '',
        player_id: 0,
        turn: 0,
        my_col: 0,
        game_play: false,
        result: '',
        ws: new WebSocket('ws://localhost:5000')
    },
    methods:{
        gameStart() {
            this.ws.send(JSON.stringify({
                msg: 'Start Game',
                game_play: this.game_play
            }))
        },

        doSomething(col) {
            if (this.turn === 1) {
                this.ws.send(JSON.stringify({
                    msg: 'Update Grid',
                    col: col,
                    player_id: this.player_id
                }));
            }
            else {
                alert("Wait For your Turn")
            }
        },

        matrixUpdate(){
            for (let i = 5; i >=0; i--) {

                if(this.arr[i][this.my_col] == ''){

                    if(this.turn === 1) {
                        newRow = this.arr[i].slice(0)
                        newRow[this.my_col] = this.opp_char
                        Vue.set(this.arr, i, newRow)
                        break
                    }
                    else {
                        newRow = this.arr[i].slice(0)
                        newRow[this.my_col] = this.my_char
                        Vue.set(this.arr, i, newRow)
                        this.check_winner(i, this.my_col)
                        break
                    }                    
                }
            }
        },

        check_winner(row, col) {
            let h_flag = false
            let v_flag = false
            let d_one_flag = false
            let counter = 0
            let counter1 = 0
            let counter2 = 0
            
            // Horizontal Check
            for (let c = 0; c < 7; c++) {
                if (this.arr[row][c] === this.my_char){
                    counter += 1
					if (counter === 4)
					{
						h_flag = true
						break;
					}
				}
				else {
					counter = 0
                }                
            }

            // Vertical Check
            for (let r = 0; r < 6; r++) {
                if (this.arr[r][col] === this.my_char){
                    counter1 += 1
					if (counter1 === 4)
					{
						v_flag = true
						break;
					}
				}
				else {
					counter1 = 0
                }                    
            }

            // Diagonal Check
            while (row < 6 && row >= 0 && col < 7 && col >= 0) {
                    if (this.arr[row][col] == this.my_char) {
                        counter2 += 1
                        if (counter2 === 4) {
                            d_one_flag = true
                            break;    
                        }
                    }
                row += 1;
                col += 1;
            }
                       
            if (h_flag === true || v_flag === true || d_one_flag === true) {
                this.ws.send(JSON.stringify({
                    msg: 'Game Ended',
                }))
            }
        }
    },
    mounted() {
        this.ws.onmessage= event=>{
            let server_msg = JSON.parse(event.data)
            if (server_msg.msg === "Wait Please") {
                alert("Please Wait for Opponent to Connect")
            }
            else if (server_msg.msg === "Ok") {
                this.game_play = server_msg.game_play
                if (this.game_play === true) {
                    alert("Game Start")
                }
                this.player_id = server_msg.player_id
                this.turn = server_msg.turn
                this.my_char = server_msg.my_char
                this.opp_char = server_msg.opp_char
            }
            else if (server_msg.msg === "Matrix Updated") {
                this.my_col = server_msg.col
                this.turn = server_msg.turn
                this.matrixUpdate()
            }
            else if (server_msg.msg === "Winner") {
                alert(server_msg.new_msg)
                this.arr = Array(6).fill('').map(() => Array(7).fill(''))
                this.gameStart()   
            }
        }
    }   
}).$mount('#root') 

