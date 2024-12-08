const warnPop = document.querySelector(".warn-pop");
const warnBtn = document.querySelector(".warn-pop .warn button");
const qs = document.querySelector(".qs");
let focusLostCount = 0;
let tTime = "";
let mCheck = true;
let check2 = true;

// Timer management
let startTime = new Date().getTime();
let totalTime = localStorage.getItem("tim") || 3 * 60 * 60 * 1000; // 3 hours in milliseconds
let timerInterval;

function updateTimerDisplay(time) {
  const hours = Math.floor(time / (1000 * 60 * 60));
  const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((time % (1000 * 60)) / 1000);

  document.querySelector(".dtime").innerText = `${hours}:${minutes}:${seconds}`;
  tTime = `${hours}:${minutes}:${seconds}`;

  if (tTime === "00:00:00") {
    localStorage.clear();
    location.reload();
  }
  // console.log(time);

  localStorage.setItem("tim", time);
}

function startTimer() {
  timerInterval = setInterval(function () {
    if (mCheck) {
      let elapsedTime = new Date().getTime() - startTime;
      let remainingTime = totalTime - elapsedTime;

      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        // submitTest();
      } else {
        updateTimerDisplay(remainingTime);
      }
    } else {
      localStorage.clear();
    }
  }, 1000);
}

// Load Questions
async function loadQuestions() {
  try {
    const response = await fetch(
      "https://test-theta-inky-46.vercel.app/questions"
    );
    const data = await response.json();

    let count = 1;
    for (let part of data) {
      const section = document.createElement("div");
      section.classList.add("sec");
      const heading = document.createElement("h1");
      heading.textContent = part.part;
      section.appendChild(heading);

      for (let question of part.questions) {
        const questionBlock = document.createElement("div");
        questionBlock.classList.add("q");

        questionBlock.innerHTML = `
              <p>Q${count}. ${question.question}</p>
              <textarea 
                placeholder="Please provide your response in writing." 
                data-question="question${count}"
              ></textarea>
            `;
        section.appendChild(questionBlock);
        count++;
      }

      qs.appendChild(section);
    }

    // Add Submit Button
    const submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.classList.add("button");
    submitButton.textContent = "Submit";
    submitButton.addEventListener("click", submitTest);
    qs.appendChild(submitButton);

    // Restore saved answers
    restoreAnswers();
  } catch (error) {
    alert("Failed to load questions. Please try again later.");
  }
}

// Restore Saved Answers
function restoreAnswers() {
  document.querySelectorAll("textarea").forEach((textarea) => {
    const savedAnswer = localStorage.getItem(textarea.dataset.question);
    if (savedAnswer) textarea.value = savedAnswer;

    textarea.addEventListener("input", () => {
      localStorage.setItem(textarea.dataset.question, textarea.value);
    });
  });
}

// Submit Test
async function submitTest(confirm = true) {
  const answers = {};
  let isComplete = true;

  document.querySelectorAll("textarea").forEach((textarea, index) => {
    if (confirm) {
      if (!textarea.value.trim()) {
        isComplete = false;
        warnPop.style.display = "flex";
      } else {
        focusLostCount = 0;
        answers[`question${index + 1}`] = textarea.value.trim();
      }
    } else {
      answers[`question${index + 1}`] = textarea.value.trim();
    }
  });

  async function round() {
    if (isComplete) {
      check2 = false;
      const name = prompt("Full Name");
      const phone = prompt("Phone No.");
      const country = prompt("Country Name");
      const timeTaken = tTime;

      const ch1 = new RegExp("[A-Za-z]", "gm");
      const ch2 = new RegExp("[0-9]", "g");

      if (
        ch1.test(name) &&
        ch2.test(phone) &&
        phone.length >= 10 &&
        ch1.test(country)
      ) {
        const data = {
          name,
          phone,
          country,
          timeTaken,
          answers: JSON.stringify(answers),
        };

        alert(timeTaken);

        try {
          const response = await fetch(
            "https://test-theta-inky-46.vercel.app/submit-test",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            }
          );
          const result = await response.json();

          if (result.success) {
            mCheck = false;
            alert("Test submitted successfully!");
            location.reload();
          } else {
            alert("Test submission failed.");
          }
        } catch (error) {
          alert("An error occurred while submitting the test.");
        }
      } else {
        round();
      }
    }
  }
  round();
}

let check = true;

// Focus Detection
window.onblur = () => {
  focusLostCount++;

  if (check & check2) {
    if (focusLostCount > 2) {
      document.querySelector(".warn-pop2").style.display = "none";
      alert(
        "You have switched focus too many times. Your test will now be submitted."
      );

      submitTest(false);
      check = false;
    } else {
      document.querySelector(".warn-pop2").style.display = "flex";
      setTimeout(() => {
        document.querySelector(".warn-pop2").style.display = "none";
      }, 7000);
    }
  }
};

warnBtn.addEventListener("click", () => {
  warnPop.style.display = "none";
});

// Initialize
window.onload = () => {
  startTimer();
  loadQuestions();
};
