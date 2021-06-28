<template>
    <v-alert
        border="left"
        colored-border
        color="primary"
        elevation="1"
        class="item"
        draggable="true"
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
    props: ["item", "boardId", "listId", "itemId"],
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