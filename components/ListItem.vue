<template>
    <v-alert
        border="left"
        colored-border
        :color="color"
        elevation="1"
        class="item"
        :draggable="true"
        @dragstart="dragstart"
        @dragend="dragend"
    >
        <p>{{ item }}
            <v-btn icon class="del" @click="deleteItem">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </p>
        
    </v-alert>
</template>

<script>
export default {
    props: ["item", "color", "boardId", "listId", "itemId"],
    methods: {
        async deleteItem(){
            try{
                let boardRef = $nuxt.$fire.firestore
                    .collection("users")
                    .doc($nuxt.$fire.auth.currentUser.uid)
                    .collection("boards")
                    .doc(this.boardId)

                let doc = await boardRef
                    .get()
                let board = doc.data()
                board.id = doc.id
                
                board.lists[this.listId].list.splice(this.itemId, 1)

                await boardRef
                    .update(board, { merge: true })
            }catch(err){
                console.log(err)
            }
        },
        dragstart(e){
            e.target.style.opacity = 0.5
            this.$store.commit("SET_DRAGDATA", {
                boardId: this.boardId,
                listId: this.listId,
                itemId: this.itemId
            })
        },
        dragend(e){
            e.target.style.opacity = 1
        }
    }
}
</script>

<style>
.item p .del{
    display: none;
}
.item:hover p .del{
    display: inline;
}
</style>