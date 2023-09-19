const BASE_URL = "http://127.0.0.1:5000";
const IMAGE_URL = `${BASE_URL}/static/images`;

const moneyFormat = new Intl.NumberFormat('pt-BR',
  { style:'currency', currency: 'BRL' });

function addElementInPropertyInfoModal(info) {
  const modalInfo = document.querySelector(".__property-info");
  modalInfo.innerHTML = info;
}
function openModal(property, type) {  
  propertyInfoToModal(property)
  const propertyElement = document.querySelector('.modal');

  propertyElement.classList.add('modal-visible');

  if (type === 'visits') {
    document.querySelector('.__form').classList.remove('--visible');
    document.querySelector('.__visits').classList.add('--visible');
  } else {
    document.querySelector('.__visits').classList.remove('--visible');
    document.querySelector('.__form').classList.add('--visible');
  }
};
function closeModal() {
  const property = document.querySelector('.modal');

  property.classList.remove('modal-visible');

  addElementInPropertyInfoModal('');
};
function resetForm() {  
  document.getElementById("name").value = '';
  document.getElementById("email").value = '';
  document.getElementById("phone").value = '';
  document.getElementById("date").value = '';
  document.getElementById("property_id").value = '';
}

/**
 * Função que pega os valores do formulário de visita e com eles monta um FormData,
 * esse FormData é enviado a API para adicionar a uma propriedade uma nova visita.
 * 
 * @returns 
 */
async function addVisit() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const date = document.getElementById("date").value;
  const property_id = document.getElementById("property_id").value;

  if ([name, email, phone, date, property_id].some(item => !item)) {
    return
  }

  const propertyFormData = new FormData();

  propertyFormData.append('name', name);
  propertyFormData.append('email', email);
  propertyFormData.append('phone', phone);
  propertyFormData.append('date', date);
  propertyFormData.append('property_id', property_id);

  await fetch(`${BASE_URL}/visit`, {
    method: 'POST',
    body: propertyFormData
  })
    .then((response) => response.json())
    .then((data) => {
      closeModal();
      resetForm();
      alert('Visita marcada com sucesso!!');
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

/**
 * Função que faz a busca na API por uma única propriedade confoeme o id passado,
 *  e monta em tela o modal para adicionar uma visita a essa propriedade.
 * 
 * @param {integer} propertyId 
 * @returns 
 */
async function propertyInfoToModal(propertyId) {
  const property = await fetch(`${BASE_URL}/property?id=${propertyId}`, { method: 'GET' })
    .then(data => data.json())
    .then(response => response);

  const propertyInfo = `
      <h2>${property.title}</h2>
      <div>${property.address}</div>
    `
  
  document.getElementById('property_id').value = property.id
  addElementInPropertyInfoModal(propertyInfo);

  const visits = document.getElementById('visits-list');
  visits.innerHTML = '';
  if (property?.visits.length > 0) {
    property?.visits.forEach(visit => {
      visits.innerHTML += `
        <li>
          <span>${visit.name}</span> <span>${new Date(visit.date).toLocaleDateString()} às ${new Date(visit.date).toLocaleTimeString()}</span>
        </li>
      `
    });
    return;
  }
  visits.innerHTML = `<div class="__none-visit">
    <div>
      <span class="material-symbols-outlined">
        event_busy
      </span>
    </div>
    <div>
      Nenhuma visita agendada para essa propriedade
    </div>
  </div>`
}

/**
 * Função que faz a busca a API das propriedades
 *  e monta a listagem de propriedade em tela.
 */
async function getProperties() {
  const { properties } = await fetch(`${BASE_URL}/properties`, { method: 'GET' })
    .then(data => data.json())
    .then(response => response);

  const list = document.querySelector(".__list");
  const item = (property) => {
    return `
    <div>
      <div class="__property">
        <img
          class="__thumbnail"
          src="${IMAGE_URL}/${property.thumbnail}"
          alt="${property.type}"
        >
        <div class="__description">
          <span class="__type">${property.type}</span>
          <h2 class="__resume-address">
            ${property.title}
          </h2>

          <div class="__details">
            <span>${property.address}</span>
            <div>
              <span>${property.size}m²</span>
              <span>${property.rooms} quartos</span>
              <span>${property.bathrooms} banheiro</span>
              <span>${property.garages} vaga</span>
            </div>
          </div>

          <div class="__value">
            ${moneyFormat.format(property.value)}
          </div>
          <div class="__icons">
            <span data-title="Visitas" class="material-symbols-outlined" onclick="openModal(${property.id}, 'visits')">
              event_note
            </span>
            <span data-title="Agendar visita" class="material-symbols-outlined" onclick="openModal(${property.id})">
              calendar_add_on
            </span>
          </div>
        </div>
      </div>
    </div>
    `
  };

  properties.forEach((property) => {
    list.innerHTML += item(property);
  })
}

getProperties();

// Mascara do campo telefone
IMask(
  document.getElementById('phone'),
  {
    mask: '(00) 00000-0000'
  }
)