console.log('hola mundo!');
const noCambia = "Leonidas";

let cambia = "@LeonidasEsteban"

function cambiarNombre(nuevoNombre) {
  cambia = nuevoNombre
}

// const getUser = new Promise (function(todoBien, todoMal){
//    const numero = Math.floor((Math.random() * 10) + 1)
//    console.log(numero);
//    if (numero%2 == 0) {
//      todoBien('El numero '+numero+' es par')
//    } else {
//      todoMal('El numero '+numero+' es impar');
//    }
//  })

// getUser
//  .then(() => {
//    console.log('par')
//  })
//  .catch(() => {
//    console.log('impar')
//  });

// fetch('https://randomuser.me/api/')
//   .then(function(response){
//     console.log(response);
//     return response.json()
//   })
//   .then(function(data){
//     console.log(data);
//   })

(async function load(){

  const dataMovies = async (url) => {
    const response = await fetch(url)
    const data = await response.json()
    if (data.data.movie_count > 0){
      return data.data.movies;
    }    
    throw new Error('No hay peliculas que coincidan con su busqueda');
  }

  const $featuringContainer = document.getElementById('featuring')
  const $form = document.getElementById('form')
  const $home = document.getElementById('home')

  function setAttributes(elemento, attrs){
    for (const attr in attrs){
      elemento.setAttribute(attr, attrs[attr])
    }
  }

  const URL_MOVIES = 'https://yts.am/api/v2/list_movies.json?'

  $form.addEventListener('submit', async (event) => {
    event.preventDefault();
    $home.classList.add('search-active')
    const $loader = document.createElement('img')
    setAttributes($loader, {
      src: 'src/images/loader.gif',
      height: 50 ,
      width: 50
    })    
    $featuringContainer.innerHTML = ""
    $featuringContainer.append($loader)

    const dataForm = new FormData($form);    
    try {
      const data = await dataMovies(URL_MOVIES+'limit=1&query_term='+dataForm.get('name'))
      const movie = data[0];    
      const stringHTML = featuringTemplate(movie)        
      $featuringContainer.innerHTML = stringHTML 
    } catch (error) {      
      $loader.remove()
      $home.classList.remove('search-active')
      $form.querySelector('input').value = ""      
      alert(error.message)
    }    
  })

  function featuringTemplate(pelicula){
    return `
    <div class="featuring">
      <div class="featuring-image">
        <img src="${pelicula.medium_cover_image}" width="70" height="100" alt="">
      </div>
      <div class="featuring-content">
        <p class="featuring-title">Pelicula encontrada</p>
        <p class="featuring-album">${pelicula.title}</p>
      </div>
    </div>`
  }

  async function cacheExists(categoria){
    const nombreLista = `${categoria}List`
    const cacheList = window.localStorage.getItem(nombreLista)
    if (!cacheList) {
      const datos = await dataMovies(URL_MOVIES+`genre=${categoria}`)
      window.localStorage.setItem(nombreLista,JSON.stringify(datos))
      return datos
    } else {
      return JSON.parse(cacheList)
    }
    
  }

  const $actionContainer = document.querySelector('#action')  
  const accion = await cacheExists('action')   
  listaTemplate($actionContainer, accion, 'action')

  const $dramaContainer = document.querySelector('#drama')
  const drama = await cacheExists('drama')     
  listaTemplate($dramaContainer, drama, 'drama')

  const $animationContainer = document.querySelector('#animation')
  const animation = await cacheExists('animation')     
  listaTemplate($animationContainer, animation, 'animation')  

  const $modal = document.getElementById('modal')
  const $overlay = document.getElementById('overlay')
  const $hideModal = document.getElementById('hide-modal')

  const $modalTittle = $modal.querySelector('h1')
  const $modalImg = $modal.querySelector('img')
  const $modalDesc = $modal.querySelector('p')

  function videoItemTemplate(movie, category){
    return (
    `<div class="primaryPlaylistItem" data-id= "${movie.id}" data-category="${category}">
      <div class="primaryPlaylistItem-image">
        <img src="${movie.medium_cover_image}">
      </div>
      <h4 class="primaryPlaylistItem-title">
        ${movie.title}
      </h4>
    </div>`
    )
  }

  function findMovie(id, categoria) {
    let lista
    switch (categoria){
      case 'action': {
        console.log('entro accion')
        lista = accion
        break;
      }            
      case 'drama':{
        console.log('entro drama')
        lista = drama
        break;
      }
      default:{
        console.log('entro animacion')
        lista = animation
        break;
      }
    }    
    const movie = lista.find(movie => movie.id === parseInt(id,10))
    return movie
  }

  function showModal(elemento){
    const id = elemento.dataset.id
    const categoria = elemento.dataset.category    
    $overlay.classList.add('active')
    $modal.style.animation = 'modalIn .8s forwards'
    const dataMovie = findMovie(id,categoria)
    $modalTittle.textContent = dataMovie.title
    $modalImg.src = dataMovie.medium_cover_image
    $modalDesc.textContent = dataMovie.synopsis
  }

  function hideModal(){    
    $modal.style.animation = 'modalOut .8s forwards'
    $overlay.classList.remove('active')
  }

  $hideModal.addEventListener('click',hideModal)

  function agregarEvento(elemento){
    elemento.addEventListener('click', () => {      
      showModal(elemento)
    })
  }
  function crearElemento(HTMLString){
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString
    return html.body.children[0]
  }

  function listaTemplate(contenedor, listaPeliculas, categoria) {
    contenedor.children[0].remove()
    listaPeliculas.forEach((movie) => {
      const HTMLString = videoItemTemplate(movie, categoria);
      const elemento = crearElemento(HTMLString);
      contenedor.append(elemento)
      const imagen = elemento.querySelector('img')
      imagen.addEventListener('load',(evento) => {
        evento.srcElement.classList.add('fadeIn')
      })      
      agregarEvento(elemento)
    })
  }  
})()