<template>
  <v-form v-model="valid">
    <v-container>
      <v-row
        align="center"
        justify="center"
      >
          <v-col
            cols="12"
            md="6"
            sm="8"
          >
            <v-row>
                <v-col
                  cols="12"
                >
                  <h1 class="text-h2 font-weight-bold primary--text">Login to your account</h1>
                </v-col>

                <v-col
                    cols="12"
                >
                <v-text-field
                    v-model="email"
                    :rules="emailRules"
                    label="E-mail"
                    required
                ></v-text-field>
                </v-col>

                 <v-col
                    cols="12"
                >
                <v-text-field
                    v-model="pwd"
                    :rules="pwdRules"
                    label="Password"
                    type="password"
                    required
                ></v-text-field>
                </v-col>

                <v-col
                    cols="12"
                >
                    <v-btn
                        color="primary"
                        :loading="loading"
                        :disabled="loading || !valid"
                        @click="login"
                    >Login</v-btn>
                </v-col>
            </v-row>
          </v-col>
      </v-row>
      <v-snackbar
        v-model="snackbar"
        timeout="3000"
      >
        {{ snackbarText}}
      </v-snackbar>
    </v-container>
  </v-form>
</template>

<script>
  export default {
    data: () => ({
      loading: false,
      valid: false,
      pwd: '',
      pwdRules: [
        v => !!v || 'Password is required',
        v => v.length > 5 || 'Password must be atleast 6 characters',
        v => v.length < 21 || 'Password must be at most 20 characters',
      ],
      email: '',
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) || 'E-mail must be valid',
      ],
      snackbar: false,
      snackbarText: "hello"
    }),
    methods: {
      async login(){
        this.loading = true
        try{
          let user = await this.$fire.auth.signInWithEmailAndPassword(this.email, this.pwd)
          if(user){
            $nuxt.$router.push("/")
          }else{
            this.snackbar = true
            this.snackbarText = "Could not login"
            this.loading = false
          }
        }catch(err){
          this.snackbar = true
          this.snackbarText = err
          this.loading = false
        }
      }
    }
  }
</script>