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
      <nuxt-link to="/auth/login"  v-if="!$store.state.user">
        <v-btn icon>
          <v-icon>mdi-login</v-icon>
        </v-btn>
      </nuxt-link>
      <span v-else>
        <v-btn icon @click="showAddBoardModal = true">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn icon @click="logout">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </span>
    </v-app-bar>

    <v-container>
      <p v-if="boards.length < 1" class="gery--text">No boards yet.</p>
      <div v-else>
          <v-row>
            <v-col
              cols="12"
              lg="3"
              md="4"
              sm="6"
              v-for="(board, index) in boards" :key="index"
            >
              <nuxt-link :to="'/boards/' + board.id">
                <v-card>
                  <v-card-title>{{ board.name }}</v-card-title>
                </v-card>
              </nuxt-link>
            </v-col>
          </v-row>
      </div>
    </v-container>

    <v-overlay :value="showAddBoardModal">
      <v-card
        elevation="3"
        light
      >
        <v-card-title>Create board</v-card-title>
        <v-card-text>
          <v-form v-model="valid" @submit.prevent="createBoard">
            <v-text-field
              label="Enter board name"
              v-model="createBoardModel"
              :rules="createBoardModelRules"
            >

            </v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            plain
            @click="showAddBoardModal = false"
          >cancel</v-btn>
          <v-btn
            color="primary"
            :disabled="loading || !valid"
            :loading="loading"
            @click="createBoard"
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
export default {
  data: () => ({
    showAddBoardModal: false,
    createBoardModel: "",
    createBoardModelRules: [
      v => !!v || 'Board name is required',
      v => v.length > 5 || 'Board name must be atleast 6 characters',
      v => v.length < 21 || 'Board name must be at most 20 characters'
    ],
    valid: false,
    loading: false,
    snackbar: false,
    snackbarText: "",
    boards: [],
    unsubscribe: () => {}
  }),
  mounted(){
    try{
      if(!$nuxt.$fire.auth.currentUser) return
      this.unsubscribe = $nuxt.$fire.firestore
        .collection("users")
        .doc($nuxt.$fire.auth.currentUser.uid)
        .collection("boards")
        .onSnapshot(querySnapshot => {
          this.boards = []
          if(querySnapshot.docs.length > 0){
            for(const doc of querySnapshot.docs){
              let data = doc.data()
              data.id = doc.id
              this.boards.push(data)
            }
          }
        })
    }catch(err){
      console.log(err)
    }
  },
  destroyed(){
    this.unsubscribe()
  },
  methods: {
    logout(){
      $nuxt.$fire.auth.signOut()
    },
    async createBoard(){
      if(this.createBoardModel.length < 5){
        this.snackbar = true
        this.snackbarText = "Board name must be at least 6 characters"
        return
      }
      this.loading = true
      try{
        await this.$fire.firestore
          .collection("users")
          .doc(this.$fire.auth.currentUser.uid)
          .collection("boards")
          .add({
            name: this.createBoardModel
          })
        this.createBoardModel = ""
        this.showAddBoardModal = false
        this.loading = false
        this.snackbar = true
        this.snackbarText = "Board created"
      }catch(err){
        this.loading = false
        this.snackbar = true
        this.snackbarText = err
      }
    }
  }
}
</script>
