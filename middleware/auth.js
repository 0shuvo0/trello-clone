export default function ({app, route, redirect}){
    if (route.path !== '/auth/login') {
      //we are on a protected route
      if(!app.$fire.auth.currentUser) {
        //take them to sign in page
        return redirect('/auth/login')
      }
    } else {
      if(app.$fire.auth.currentUser) {
        return redirect('/')
      }
    }
  }
  