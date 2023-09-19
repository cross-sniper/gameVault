(function () {
  window.START = "void"; // Set the initial location
  window.CURRENT = "";
  window.LOCATIONS = document.getElementsByTagName("loc"); // Get all <loc> elements
  window.SCRIPTS = {}; // Store script content for each location

  // Function to replace variables in content
  function replaceVariables(content) {
    const regex = /\$([a-zA-Z_][a-zA-Z0-9_]*)/g;
    content = content.replace(regex, (_, variableName) => window[variableName] || '')

    return content;
  }

  // Function to navigate to a location
  window.goto = function (id) {
    if (id === CURRENT) return; // Prevent transitioning to the same location
    if (!LOCATIONS[id]) {
      console.error(`Location not found: ${id}`);
      return;
    }
    try {
      // Hide the current location
      LOCATIONS[CURRENT].style.display = "none";
    } catch (e) {
      if (id == START) {
        CURRENT = START;
      } else {
        alert(`${e}
          resetting to main menu`);
        CURRENT = START;
      }
    }
    // Execute the <script> code if it exists
    const scripts = LOCATIONS[id].querySelectorAll("locscript");

    for (script of scripts) {
      try {

        console.log(`executing\n%c${script.textContent.replaceAll("<br>",'')}`, "color:rgba(200,200,200,0.9); font:bold;")
        eval(script.textContent); // Execute the code within <script>
      } catch (error) {
        alert(`Error executing <locscript> in ${CURRENT}: ${error}`);
      }
    }

    // Show the target location and replace variables
    LOCATIONS[id].style.display = "";
    LOCATIONS[id].innerHTML = replaceVariables(LOCATIONS[id].innerHTML);
    CURRENT = id;
  };


  goto(START);
})();
