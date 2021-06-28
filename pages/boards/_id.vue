<template>
  <div>
      <v-app-bar
        color="primary"
        dense
        dark
      >
      <v-toolbar-title>
        <nuxt-link to="/">Trello Clone</nuxt-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <nuxt-link to="/">
        <v-btn icon>
          <v-icon>mdi-home</v-icon>
        </v-btn>
      </nuxt-link>
      <v-btn icon>
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-app-bar>

    <v-container>
      <p class="pb-2">
        <v-btn
          color="red"
          class="white--text mr-1"
          @click="deleteBoard"
          :disabled="deleting"
          :loading="deleting"
        >delete board</v-btn>
        <v-btn
          color="primary"
          @click="showAddListModal = true"
        >new list</v-btn>
      </p>
      <v-row v-if="board.lists && board.lists.length > 0">
        <v-col
          cols="12"
          lg="3"
          md="4"
          sm="6"
          v-for="(list, index) in board.lists"
          :key="index"
        >
          <List :list="list" :boardId="board.id" :listId="index" />
          
        </v-col>
      </v-row>
      <p v-else class="gery--text">No lists yet</p>
    </v-container>

    <v-overlay :value="showAddListModal">
      <v-card
        elevation="3"
        light
      >
        <v-card-title>Create list</v-card-title>
        <v-card-text>
          <v-form v-model="valid" @submit.prevent="createList">
            <v-text-field
              label="Enter list name"
              v-model="createListModel"
              :rules="createListModelRules"
            >

            </v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            plain
            @click="showAddListModal = false"
          >cancel</v-btn>
          <v-btn
            color="primary"
            :disabled="loading || !valid"
            :loading="loading"
            @click="createList"
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


  </div>
</template>

<script>
import List from "../../components/List.vue"

export default {
  components: {
    List
  },
  data: () => ({
    showAddListModal: false,
    createListModel: "",
    createListModelRules: [
      v => !!v || 'List name is required',
      v => v.length > 2 || 'List name must be atleast 3 characters',
      v => v.length < 21 || 'List name must be at most 20 characters'
    ],
    valid: false,
    loading: false,
    snackbar: false,
    snackbarText: "",
    board: {},
    unsubscribe: () => {},
    deleting: false
  }),
  methods: {
    async createList(){
      if(this.createListModel.length < 3){
        this.snackbar = true
        this.snackbarText = "List name must be at least 6 characters"
        return
      }
      this.loading = true
      try{
        if(this.board.lists){
          this.board.lists.push({ name: this.createListModel })
        }else{
          this.board.lists = []
          this.board.lists.push({ name: this.createListModel })
        }
        await this.$fire.firestore
          .collection("users")
          .doc(this.$fire.auth.currentUser.uid)
          .collection("boards")
          .doc(this.$route.params.id)
          .update(this.board, { merge: true })
        this.createListModel = ""
        this.showAddListModal = false
        this.loading = false
        this.snackbar = true
        this.snackbarText = "Board created"
      }catch(err){
        this.loading = false
        this.snackbar = true
        this.snackbarText = err
      }
    },
    async deleteBoard(){
      this.deleting = true
      try{
        await $nuxt.$fire.firestore
          .collection("users")
          .doc($nuxt.$fire.auth.currentUser.uid)
          .collection("boards")
          .doc(this.$route.params.id)
          .delete()
        this.$router.push({ path: "/" })
      }catch(err){
          console.log(err)
      }
      this.deleting = false
    }
  },
  created(){
    if(!$nuxt.$fire.auth.currentUser) return
    try{
      this.unsubscribe = $nuxt.$fire.firestore
        .collection("users")
        .doc($nuxt.$fire.auth.currentUser.uid)
        .collection("boards")
        .doc(this.$route.params.id)
        .onSnapshot(doc => {
          if(doc.exists){
            this.board = doc.data()
            this.board.id = doc.id
          }else{
            this.board = {}
          }
        })
    }catch(err){
      console.log(err)
    }
  },
  destroyed(){
    this.unsubscribe()
  }
}
</script>

<style>

</style>