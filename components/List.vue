<template>
    <v-card
        style="min-height: 80vh"
        @drop="alert(3)"
    >
        <v-app-bar flat>
            <v-toolbar-title>{{ list.name }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon>
                <v-icon @click="showAddItemModal = true">mdi-plus</v-icon>
            </v-btn>
            <v-btn icon @click="deleteList">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
        </v-app-bar>
        <v-card-text>
            <p class="grey--text text-center" v-if="!list.list || list.list.length < 1">No items yet.</p>
            <div v-else>
                <ListItem v-for="(item, index) in list.list" :key="index" :item="item" :boardId="boardId" :listId="listId" :itemId="index" />
            </div>
        </v-card-text>

        <v-overlay :value="showAddItemModal">
            <v-card
                elevation="3"
                light
            >
                <v-card-title>Add Item</v-card-title>
                <v-card-text>
                <v-form v-model="valid" @submit.prevent="createItem">
                    <v-text-field
                    label="Enter item name"
                    v-model="createItemModel"
                    :rules="createItemModelRules"
                    >

                    </v-text-field>
                </v-form>
                </v-card-text>
                <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    plain
                    @click="showAddItemModal = false"
                >cancel</v-btn>
                <v-btn
                    color="primary"
                    :disabled="loading || !valid"
                    :loading="loading"
                    @click="createItem"
                >create</v-btn>
                </v-card-actions>
            </v-card>
        </v-overlay>

    <v-snackbar
      v-model="snackbar"
      timeout="3000"
    >
      {{ snackbarText}}
    </v-snackbar>
    </v-card>
</template>

<script>
import ListItem from "./ListItem.vue"

export default {
    components: {
        ListItem
    },
    props: ["list", "boardId", "listId"],
    data: () => ({
        showAddItemModal: false,
        createItemModel: "",
        createItemModelRules: [
        v => !!v || 'Item name is required',
        v => v.length > 5 || 'Item name must be atleast 6 characters',
        v => v.length < 101 || 'Item name must be at most 100 characters'
        ],
        valid: false,
        loading: false,
        snackbar: false,
        snackbarText: ""
    }),
    methods: {
        async createItem(){
            if(this.createItemModel.length < 5){
                this.snackbar = true
                this.snackbarText = "Item name must be at least 6 characters"
                return
            }
            this.loading = true
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
                
                if(board.lists[this.listId].list){
                    board.lists[this.listId].list.push(this.createItemModel)
                }else{
                    board.lists[this.listId].list = []
                    board.lists[this.listId].list.push(this.createItemModel)
                }

                await boardRef
                    .update(board, { merge: true })

                this.createItemModel = ""
                this.showAddItemModal = false
                this.loading = false
                this.snackbar = true
                this.snackbarText = "Item added"
            }catch(err){
                this.loading = false
                this.snackbar = true
                this.snackbarText = err
            }
        },
        async deleteList(){
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
                
                board.lists.splice(this.listId, 1)

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
.v-alert{
    border-radius: 0 !important;
}
</style>