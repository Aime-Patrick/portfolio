// SHOW MENU

const navMenu = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose = document.getElementById('nav-close');

// MENU SHOW
if (navToggle) {
    navToggle.addEventListener('click',()=>{
        navMenu.classList.add('show-menu')
    })
}   

// MENU HIDDEN

if (navClose) {
    navClose.addEventListener('click',() =>{
        navMenu.classList.remove('show-menu')
    })
}

// REMOVE MENU MOBILE

const navLink = document.querySelectorAll('.nav__link')

const linkAction = () =>{
    const navMenu = document.getElementById('nav-menu')
    navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click',linkAction))


const shadowHeader = () =>{
    const header = document.getElementById('header')
    // When the scroll is greater than 50 viewport height, add the scroll-header class to the header tag
    this.scrollY >= 50 ? header.classList.add('shadow-header') 
                       : header.classList.remove('shadow-header')
}
window.addEventListener('scroll', shadowHeader)


// Email JS

const contactForm = document.getElementById("contact-form"),
        contactMessage = document.getElementById('contact-message');

        const sendEmail = (e) =>{
            e.preventDefault();

            emailjs.sendForm('service_kzutdjf','template_h8w87eq','#contact-form','mbdQfTjlWxjvdh2ij').then(() =>{
                contactMessage.textContent = 'Message sent successfully ✅'
                setTimeout(()=>{
                    contactMessage.textContent =''
                },5000)

                contactForm.reset()
            }, () =>{
                contactMessage.textContent ='Message not sent (service error) ❌'
            })
        }

        contactForm.addEventListener('submit', sendEmail);