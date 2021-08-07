const auth = firebase.auth()
const db = firebase.firestore()
const loginForm = document.querySelectorAll('.login-signup')[0]

const signupForm = document.querySelectorAll('.login-signup')[1]

const nav_to_login = document.querySelector('#nav-to-login')

const nav_to_signup = document.querySelector('#nav-to-signup')

const login_submit = document.querySelector('#login-submit')

const signup_submit = document.querySelector('#signup-submit')
const forgotpwd = document.querySelector('.forgot-pwd')
const details = document.querySelector('.user-details')
details.style.display = 'none'
forgotpwd.addEventListener('click' , () => {
    swal({
        title : 'Reset Password',
        content: {
          element: "input",
          attributes: {
            placeholder: "Type your Email",
            type: "email",
          },
        },
      }).then(val => {
        login_submit.style.display = 'none'
        document.querySelectorAll('.loader')[0].style.display = 'block'
          auth.sendPasswordResetEmail(val).then(() => {
              swal({
                  title : 'Check Your Email',
                  icon : 'success'
              })
          }).then(() => {
            login_submit.style.display = 'block'
            document.querySelectorAll('.loader')[0].style.display = 'none'
          }).catch(err => {
                swal({
                    title : err,
                    icon : 'error'
                }).then(() => {
                    login_submit.style.display = 'block'
                    document.querySelectorAll('.loader')[0].style.display = 'none'
                })
          })
      })
})
window.onload = () => {
    try{
        const currentuser = window.localStorage.getItem('currently_loggedIn')
        if(currentuser === null){
            throw new Error('no Currentuser')
        } else {
            loginForm.style.display = 'none'
            signupForm.style.display = 'none'
            userDetails(currentuser)
        }
    } catch(err){
        loginForm.style.display = 'block'
        details.style.display = 'none'
    }
}
const userDetails = (id) => {
    window.localStorage.setItem('currently_loggedIn',id)
    var docRef = db.collection("users").doc(id);
    docRef.get().then((doc) => {
    if (doc.exists) {
        const h1 = details.children[0]
        let bool = false
        h1.textContent = `Welcome ${doc.data().userName}`
        const interval = setInterval(() => {
            bool = !bool
            bool ? h1.textContent = `Welcome` : h1.textContent = `${doc.data().userName}`
        },1000)
        const logOut = details.children[1]
        logOut.textContent = 'LogOut'
        details.style.display = 'block'
        details.style.visibility = 'visible'
        logOut.addEventListener('click' , id => {
             auth.signOut().then(() => {
                 clearInterval(interval)
                window.localStorage.removeItem('currently_loggedIn')
                details.style.display = 'none'
                   details.style.visibility = 'hidden'
                loginForm.style.display = 'block'
            }).catch(() => {
                console.log(`Error occurred while sign out`)
            })
        })
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
}).catch((error) => {
    console.log("Error getting document:", error);
})
}

nav_to_login.addEventListener('click' , () => {
    signupForm.style.display = 'none'
    loginForm.style.display = 'block'
    document.querySelector('#login').reset()
})

nav_to_signup.addEventListener('click' , () => {
    loginForm.style.display = 'none'
    signupForm.style.display = 'block'
    document.querySelector('#signup').reset()
})

signup_submit.addEventListener('click' , event => {
    event.preventDefault()
    signup_submit.style.display = 'none'
    document.querySelectorAll('.loader')[1].style.display = 'block'
    const userName = document.querySelector('#signup-username').value
    const email = document.querySelector('#signup-email').value
    const password = document.querySelector('#signup-pwd').value
    auth.createUserWithEmailAndPassword(email, password)
    .then((cred) => {
        swal({
            title : 'Account Created Successfully',
            icon : 'success'
        }).then(() => {
            db.collection('users').doc(cred.user.uid).set({
                userName : userName,
                email : email
            }).then(() => {
                signup_submit.style.display = 'block'
                document.querySelectorAll('.loader')[1].style.display = 'none'
                document.querySelector('#signup').reset()
            signupForm.style.display = 'none'
            loginForm.style.display = 'block'
            }).catch(err => {
                swal({
                    title : error,
                    icon : 'error'
                }).then(() => {
                    signup_submit.style.display = 'block'
                    document.querySelectorAll('.loader')[1].style.display = 'none'
                })
            })
        })
    })
    .catch((error) => {
        swal({
            title : error,
            icon : 'error'
        }).then(() => {
            signup_submit.style.display = 'block'
            document.querySelectorAll('.loader')[1].style.display = 'none'
        })
    })
})

login_submit.addEventListener('click' , event => {
    event.preventDefault()
    login_submit.style.display = 'none'
    document.querySelectorAll('.loader')[0].style.display = 'block'
    const email = document.querySelector('#login-email').value 
    const password = document.querySelector('#login-pwd').value
    auth.signInWithEmailAndPassword(email, password)
    .then((cred) => {
        swal({
            title : 'Login Success',
            icon : 'success'
        }).then(() => {
            login_submit.style.display = 'block'
            document.querySelectorAll('.loader')[0].style.display = 'none'
            document.querySelector('#login').reset()
            loginForm.style.display = 'none'
            userDetails(cred.user.uid)
        })
    })
    .catch(error => {
        swal({
            title : error,
            icon : 'error'
        }).then(() => {
            login_submit.style.display = 'block'
            document.querySelectorAll('.loader')[0].style.display = 'none'
        })
    })
})

auth.onAuthStateChanged(user => {
    if(user){
       console.log('Log in')
    } else {
        console.log('Logged Out')
    }
})
