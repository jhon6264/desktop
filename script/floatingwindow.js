  
const container = document.getElementById("floating-windows-container");

function createFloatingWindow(type, anchorElement) {
  // Prevent duplicate windows
  const existing = container.querySelector(`.floating-window[data-type="${type}"]`);
  if (existing) {
    existing.style.zIndex = ++zIndexCounter;
    return;
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const modal = document.createElement("div");
  modal.className = `floating-window modal-box expand-in absolute pointer-events-auto`;
  modal.dataset.type = type;

const maxModalWidth = 720;
const maxModalHeight = 400;

const paddingX = 20; // 💡 horizontal space from left/right edge
const paddingY = 20; // 💡 vertical space from top/bottom edge


// 📌 Center Y
let centerY = (vh - maxModalHeight) / 2;

// 🌀 Random horizontal offset
const horizontalRange = vw * 0.1; // 10% shift left/right from center
let randomOffsetX = (Math.random() * horizontalRange * 2) - horizontalRange;

// 💡 Add random X offset to centered position
let centerX = (vw - maxModalWidth) / 2 + randomOffsetX;

// 🛡 Clamp X and Y so it stays within the viewport + padding
centerX = Math.max(paddingX, Math.min(centerX, vw - maxModalWidth - paddingX));
centerY = Math.max(paddingY, Math.min(centerY, vh - maxModalHeight - paddingY));

// 🎯 Apply to modal
modal.style.left = `${centerX}px`;
modal.style.top = `${centerY}px`;
modal.style.zIndex = ++zIndexCounter;


  // Modal content
  let modalContent = `
    <p>This is the content of the <strong>${type}</strong> window. You can customize it here.</p>
  `;

if (type === "about") {
  modalContent = `
<div class="about-modal-content">
  <div class="about-header">
    <img src="assets/j.jpg" />
    <div class="about-text">
      <div class="name">Jhon Cristopher Potestas</div>
      <div class="degree">BS in Information Technology</div>
      <div class="year">3rd Year Student</div>
      <div class="height">5'7ft.</div>
    </div>
  </div>

  <div class="about-scrollable">
    <div class="education-section">
      <h3>Education</h3>
      <p><span class="entity">&#187;</span> Primary – Balnate Elementary School & AFPLC Elementary School</p>
      <p><span class="entity">&#187;</span> Secondary – Magsaysay Academy Inc. & Padada National High School</p>
      <p><span class="entity">&#187;</span> Tertiary – St. Mary's College of Bansalan Inc.</p>
    </div>

       <div class="interest-section">
    <h3>Interest</h3>
    <p><span class="entity">&#187;</span> Sitting under the tree</p>
    <p><span class="entity">&#187;</span> Love to raise farm animals</p>
    <p><span class="entity">&#187;</span> Playing online games when bored</p>
    <p><span class="entity">&#187;</span> Play basketball</p>
    <p><span class="entity">&#187;</span> Make fun</p>
  </div>

    <div class="language-section">
      <h3>Language & Dialect</h3>
      <p>Cebuano, Tagalog and little japanese</p>
    </div>
  </div>
</div>

  `;
}

if (type === "tools") {
  modalContent = `
    <div class="tools-modal-content tools-box">
  <h3>Design and Editing</h3>
  <div class="tools-grid">
    <div class="tools-grid-item">Figma</div>
    <div class="tools-grid-item">Photoshop</div>
    <div class="tools-grid-item">Blender</div>
    <div class="tools-grid-item">Milanote</div>
    <div class="tools-grid-item">CapCut</div>
    <div class="tools-grid-item">Microsoft Word</div>
    <div class="tools-grid-item">Microsoft PowerPoint</div>
  </div>

  <h3>Development</h3>
  <div class="tools-grid">
    <div class="tools-grid-item">Visual Studio Code</div>
    <div class="tools-grid-item">Visual Studio 2022</div>
    <div class="tools-grid-item">DevC++</div>
    <div class="tools-grid-item">Apache Netbeans</div>
    <div class="tools-grid-item">Godot Engine</div>
    <div class="tools-grid-item">Cisco Packet Tracer</div>
    <div class="tools-grid-item">XAMPP</div>
  </div>

  <h3>Programming Languages</h3>
  <div class="tools-grid">
    <div class="tools-grid-item">C++</div>
    <div class="tools-grid-item">Java</div>
    <div class="tools-grid-item">JavaScript</div>
  </div>
</div>

  `;
}


if (type === "projects") {
  modalContent = `
    <div class="projects-modal-content projects-box">

      <!-- Website -->
      <h3 class="project-section-title">Website</h3>
      <div class="project-item">
        <img src="assets/portfolio.png" alt="Portfolio Project">
        <div class="project-text">
          <div class="project-title">First Online Portfolio</div>
          <p class="project-description">My first static web portfolio, which includes a variety of my information.  Examples include name, education, achievement, and links to social media platforms.  
          It was created in my second year as a midterm project.</p>
              <div class="tools-grid">
  <span class="tools-grid-item">HTML</span>
  <span class="tools-grid-item">CSS</span>
  <span class="tools-grid-item">JS</span>
  <span class="tools-grid-item">Bootstrap 5</span>
  <span class="tools-grid-item">Email.js</span>
              </div>
          <a href="https://jhon6264.github.io/portfolio/" target="_blank" class="view-project-btn">
            <span class="anchor">View Portfolio</span>
          </a>
        </div>
      </div>

      <hr class="project-separator" />

      <!-- Game Development -->
      <h3 class="project-section-title">Game Development</h3>
      <div class="project-item">
        <img src="assets/swaggy.png" alt="Swaggy Adventure">
        <div class="project-text">
          <div class="project-title">Swaggy Adventure</div>
          <p class="project-description">An interactive 2D pixel game created for our 2nd semester project in my second year. All of the assets were downloaded from itch.io,
           pixabay, and freesound because I didn't know how to make them. But overall, 
          it was a good experience as a beginner.</p>
<div class="tools-grid">
  <span class="tools-grid-item">GD Script</span>
  <span class="tools-grid-item">C++</span>
  <span class="tools-grid-item">C</span>
  <span class="tools-grid-item">Itch.io Assets</span>
  <span class="tools-grid-item">Freesound</span>
  <span class="tools-grid-item">Pixabay</span>
</div>

        </div>
      </div>
      <div class="project-item">
        <img src="assets/pakman.png" alt="Pakman Lite">
        <div class="project-text">
          <div class="project-title">Pakman Lite</div>
          <p class="project-description">An interactive 3d game-like  minecraft style, where the player
          were chase by the balls(enemy), collecting coins and potions to enable the player to survive
          and set highest score. It was made during our second semester Final.
          </p>
<div class="tools-grid">
  <span class="tools-grid-item">Godot Engine</span>
  <span class="tools-grid-item">Blender</span>
  <span class="tools-grid-item">ElevenLabs</span>
  <span class="tools-grid-item">Figma</span>
</div>

        </div>
      </div>

      <hr class="project-separator" />

      <!-- Application -->
      <h3 class="project-section-title">Application</h3>
      <div class="project-item">
        <img src="assets/registration.png" alt="Registration System">
        <div class="project-text">
          <div class="project-title">Registration System</div>
          <p class="project-description">This system was my first "functional system." It was created during our first semester final. 
          I used Visual Studio 2022 as an IDE and Figma to 
          design the layouts, colors, and so on. For the database, I used localhost MySQL with the XAMPP management panel.
          </p>
<div class="tools-grid">
  <span class="tools-grid-item">VB.net</span>
  <span class="tools-grid-item">Figma</span>
  <span class="tools-grid-item">Photoshop</span>
  <span class="tools-grid-item">Flaticon</span>
  <span class="tools-grid-item">MySQL</span>
  <span class="tools-grid-item">XAMPP</span>
</div>

        </div>
      </div>

    </div>
  `;
}



if (type === "links") {
  modalContent = `
    <div class="links-modal-content links-box">
      <div class="icon-grid-wrapper">

        <div class="icon-row">
          <a href="https://www.instagram.com/jhoncrispotestas/" target="_blank" class="icon-link">
            <i class="bi bi-instagram"></i>
            <span class="label">Instagram</span>
          </a>
          <a href="https://www.facebook.com/jhoncristopher.relativopotestas.7/" target="_blank" class="icon-link">
            <i class="bi bi-facebook"></i>
            <span class="label">Facebook</span>
          </a>
          <a href="https://www.facebook.com/jhoncristopher.relativopotestas.7/" target="_blank" class="icon-link">
            <i class="bi bi-youtube"></i>
            <span class="label">Youtube</span>
          </a>
        </div>

        <div class="icon-row">
          <a href="https://t.me/jcrp6264" target="_blank" class="icon-link">
            <i class="bi bi-telegram"></i>
            <span class="label">Telegram</span>
          </a>
          <a href="https://discord.com/users/supremooo0126_91732" target="_blank" class="icon-link">
            <i class="bi bi-discord"></i>
            <span class="label">Discord</span>
          </a>
        </div>
        <p class="link-warning">If you click a link, it will open a new tab!</p>
      </div>
    </div>
  `;
}

if (type === "contact") {
  modalContent = `
    <form id="contact-form" class="contact-modal-content">
      <label for="from_email">Your Email</label>
      <input type="email" name="from_email" id="from_email" placeholder="example@email.com" required />

      <label for="from_name">Your Name</label>
      <input type="text" name="from_name" id="from_name" placeholder="Jhon Cristopher Potestas" required />

      <label for="message">Enter your message</label>
      <textarea name="message" id="message" rows="4" placeholder="Type your message here..." required></textarea>

      <button type="submit" class="send-btn">Send</button>
    </form>
    <div id="floating-alert" class="floating-alert hidden">✅ Message Sent!</div>
  `;
}



  modal.innerHTML = `
    <div class="modal-header relative">
      <div class="modal-title capitalize">${type}</div>
      <i class="bi bi-x text-[clamp(1.5rem,4vw,1.7rem)] absolute top-2 right-4 cursor-pointer hover:scale-110 transition-transform close-btn"></i>
    </div>
    <div class="modal-divider"></div>
    <div class="modal-content">
      ${modalContent}
    </div>
  `;

  // Dragging setup
  let isDragging = false, startX = 0, startY = 0;
  const header = modal.querySelector('.modal-header');

  const onMove = (x, y) => {
    if (!isDragging) return;
    const newX = x - startX;
    const newY = y - startY;
    modal.style.left = `${newX}px`;
    modal.style.top = `${newY}px`;
  };

  const stopDragging = () => {
    isDragging = false;
    document.body.classList.remove("dragging");
    header.classList.remove("dragging");
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', stopDragging);
    document.removeEventListener('touchmove', touchMove);
    document.removeEventListener('touchend', stopDragging);
  };

  const mouseMove = (e) => onMove(e.clientX, e.clientY);
  const touchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    onMove(touch.clientX, touch.clientY);
  };

  // Mouse drag
  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - modal.offsetLeft;
    startY = e.clientY - modal.offsetTop;
    modal.style.zIndex = ++zIndexCounter;
    document.body.classList.add("dragging");
    header.classList.add("dragging");

    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', stopDragging);
  });

  // Touch drag
  header.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    isDragging = true;
    startX = touch.clientX - modal.offsetLeft;
    startY = touch.clientY - modal.offsetTop;
    modal.style.zIndex = ++zIndexCounter;
    document.body.classList.add("dragging");
    header.classList.add("dragging");

    document.addEventListener('touchmove', touchMove, { passive: false });
    document.addEventListener('touchend', stopDragging);
  });

  //Close button
modal.querySelector(".close-btn").onclick = () => {
  playSound("audio/closeclick.mp3");
  modal.classList.remove('expand-in');
  modal.classList.add('expand-out');
  setTimeout(() => modal.remove(), 400); 
};



  // Append to DOM
  container.appendChild(modal);

  // Add sound for "View Portfolio" buttons
modal.querySelectorAll(".view-project-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
   playSound('audio/closeclick.mp3');
  });
});

// Add click sound to all icon links inside links modal
if (type === "links") {
  modal.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
    playSound('audio/closeclick.mp3');
    });
  });
}

  // Bring to front on focus
  modal.addEventListener("mousedown", () => {
    modal.style.zIndex = ++zIndexCounter;
  });
  modal.addEventListener("touchstart", () => {
    modal.style.zIndex = ++zIndexCounter;
  });
}


// Modals are created dynamically when an icon is clicked:
document.querySelectorAll(".icon-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    const type = item.getAttribute("data-window");
    createFloatingWindow(type, e.currentTarget);
  });
});

// 2. Show the floating modal (success or error)
function showFloatingModal(success = true) {
  const modal = document.getElementById('floating-modal');
  const text = document.getElementById('floating-text');
  const icon = document.getElementById('floating-icon');

  if (success) {
    text.textContent = 'Message Sent Successfully!';
    icon.className = 'bi bi-envelope-check text-green-500';
  } else {
    text.textContent = 'Message Denied! Please Retry.';
    icon.className = 'bi bi-x text-red-500';
  }

  modal.classList.remove('hidden');
  modal.classList.add('show');

  setTimeout(() => {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 400);
  }, 2000);
}

// 3. EmailJS config and submission logic
emailjs.init("JgALoWAfPc0J_yYxJ");

document.addEventListener("submit", function (e) {
  if (e.target && e.target.id === "contact-form") {
    e.preventDefault();
    playSound('audio/closeclick.mp3');
    

    emailjs.sendForm("service_z4wckrd", "template_svzib4n", e.target)
      .then(function () {
        showFloatingModal(true);
        playSound('audio/message.mp3');  
        e.target.reset();
      }, function (error) {
        showFloatingModal(false); 
        console.error(error);
      });
  }
});


// Trigger from icons
document.querySelectorAll(".icon-item").forEach((item) => {
item.addEventListener("click", (e) => {
  const type = item.getAttribute("data-window");
    playSound('audio/click.mp3');
  createFloatingWindow(type, e.currentTarget); 
});
});



