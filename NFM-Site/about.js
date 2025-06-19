const teamData = [
  {
    name: "Eric M",
    title: "Web Developer",
    img: "https://newfaithministriesorg.wordpress.com/wp-content/uploads/2025/06/51dc2e06-47ef-4f58-8b30-622b6577dea4-1.jpg",
    desc: "Eric M develops and manages our church website and online presence, ensuring a seamless digital experience."
  },
  {
    name: "Kelly",
    title: "Social Media Manager",
    img: "https://newfaithministriesorg.wordpress.com/wp-content/uploads/2025/06/kelly.jpg",
    desc: "Kelly shares our ministry with the world through engaging social media and uplifting content."
  },
  {
    name: "George",
    title: "Bassist",
    img: "https://newfaithministriesorg.wordpress.com/wp-content/uploads/2025/06/george-1.jpg",
    desc: "George brings soulful music to our services, blessing the congregation as a dedicated band leader."
  },
  {
    name: "Darryl",
    title: "Finance Manager",
    img: "https://newfaithministriesorg.wordpress.com/wp-content/uploads/2025/06/darryl.jpg",
    desc: "Darryl oversees church finances with integrity, ensuring responsible stewardship of resources."
  },
  {
    name: "Dave",
    title: "Deacon",
    img: "https://newfaithministriesorg.wordpress.com/wp-content/uploads/2025/06/dave.jpg",
    desc: "Dave supports the church body with wisdom and kindness as a devoted deacon."
  },
  {
    name: "Avon",
    title: "Upcoming Ordained Minister",
    img: "https://newfaithministriesorg.wordpress.com/wp-content/uploads/2025/06/avon.png",
    desc: "Avon is preparing for ordination, actively serving with a strong heart for ministry and leadership."
  },
  {
    name: "Michael",
    title: "Drummer",
    img: "https://newfaithministriesorg.wordpress.com/wp-content/uploads/2025/06/b3e40d98-8610-4f7d-a6dc-b2759758717d.jpeg",
    desc: "Michael brings passion and rhythm to every service, helping lead the church in powerful worship through his gift on the drums."
  },
  {
    name: "Chris",
    title: "Keyboardist",
    img: "https://newfaithministriesorg.wordpress.com/wp-content/uploads/2025/06/chris.jpeg",
    desc: "Chris leads on the keys at NFM, helping create a powerful and spirit-led worship atmosphere every service."
  }
];

const teamGrid = document.getElementById('teamGrid');

teamData.forEach(member => {
  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <img src="${member.img}" alt="${member.name}" />
    <h3>${member.name}</h3>
    <span>${member.title}</span>
    <div class="description">${member.desc}</div>
  `;

  teamGrid.appendChild(card);
});
