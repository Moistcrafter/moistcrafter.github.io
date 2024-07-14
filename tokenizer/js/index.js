import { env, AutoTokenizer } from "/tokenizer/js/vendors/transformers.js";

env.allowLocalModels = false;
const TOKENIZER_MAPPINGS = new Map();

async function tokenize(text, model) {
  let tokenizerPromise = TOKENIZER_MAPPINGS.get(model);

  if (!tokenizerPromise) {
    tokenizerPromise = AutoTokenizer.from_pretrained(model);

    TOKENIZER_MAPPINGS.set(
      model,
      new Promise((resolve) => {
        tokenizerPromise.then((tokenizer) => {
          // NOTE: We just remove the StripDecoder from the llama tokenizer
          switch (tokenizer.constructor.name) {
            case "LlamaTokenizer":
            case "Grok1Tokenizer":
              // tokenizer.decoder.decoders.at(-1).constructor.name === 'StripDecoder'
              tokenizer.decoder.decoders.pop();
              break;
            case "T5Tokenizer":
              tokenizer.decoder.addPrefixSpace = false;
              break;
          }
          resolve(tokenizer);
        });
      })
    );
  }

  const tokenizer = await tokenizerPromise;

  const start = performance.now();
  const token_ids = tokenizer.encode(text);
  const end = performance.now();
  // console.log("[INFO]", `Tokenized ${text.length} characters in ${(end - start).toFixed(2)}ms`);

  let decoded = token_ids.map((x) => tokenizer.decode([x]));

  let margins = [];

  // Minor post-processing for visualization purposes
  switch (tokenizer.constructor.name) {
    case "BertTokenizer":
      margins = decoded.map((x, i) => (i === 0 || x.startsWith("##") ? 0 : 8));
      decoded = decoded.map((x) => x.replace("##", ""));
      break;
    case "T5Tokenizer":
      if (decoded.length > 0 && decoded.length !== " ") {
        decoded[0] = decoded[0].replace(/^ /, "");
      }
      break;
  }
  // console.log({ decoded, token_ids, margins });
  return { tokens: decoded, ids: token_ids, margins: margins };
}

let showIDS = false;

function convertText() {
  exampleCheck();
  const inputText = document.getElementById("inputText").value;
  const model = document.querySelector(".button-model.selected").value;

  tokenize(inputText, model).then((data) => {
    const tokenArr = showIDS ? data.ids : data.tokens;
    const tokenCount = tokenArr.length;
    const tokenOutputDiv = document.getElementById("tokenOutput");
    tokenOutputDiv.innerHTML = "";

    let tokenIndexIterator = 0;
    tokenArr.forEach((token) => {
      const span = document.createElement("span");
      span.textContent = showIDS ? ` ${token} ` : token;
      span.classList.add("token");
      span.style.backgroundColor = colorify(tokenIndexIterator);
      tokenOutputDiv.appendChild(span);
      tokenIndexIterator++;
    });

    const tokenCountDiv = document.getElementById("tokenCount");
    tokenCountDiv.textContent = `${tokenCount}`;
    const characterCountDiv = document.getElementById("characterCount");
    characterCountDiv.textContent = `${inputText.length}`;
  });
}

function colorify(num) {
  const number = num % 5;
  switch (number) {
    case 0:
      return `#6B40D84D`;
    case 1:
      return `#68DE7A66`;
    case 2:
      return `#F4AC3666`;
    case 3:
      return `#EF414666`;
    case 4:
      return `#27B5EA66`;
  }
}

function clearOutput() {
  document.getElementById("tokenCount").textContent = "0";
  document.getElementById("characterCount").textContent = "0";
  document.getElementById("tokenOutput").innerHTML = "";
  exampleCheck();
}

const inputText = document.getElementById("inputText");
inputText.addEventListener("input", convertText);

const textRadio = document.getElementById("text");
const tokenIdsRadio = document.getElementById("token-ids");
function handleRadioChange(event) {
  if (event.target.checked) {
    showIDS = event.target.id === "token-ids";
    convertText();
  }
}
textRadio.addEventListener("change", handleRadioChange);
tokenIdsRadio.addEventListener("change", handleRadioChange);

function clearText() {
  document.getElementById("inputText").value = "";
  clearOutput();
}
document.getElementById("clearText").onclick = clearText;

const exampleText = `Many words map to one token, but some don't: indivisible. Unicode characters like emojis may be split into many tokens containing the underlying bytes: 🤚🏾 Sequences of characters commonly found next to each other may be grouped together: 1234567890. Poorly filtered website results may lead to bad tokens such as 给主人留下些什么吧`;

function showExample() {
  document.getElementById("inputText").value = exampleText;
  convertText();
}
document.getElementById("exampleButton").onclick = showExample;

function exampleCheck() {
  const exampleButton = document.getElementById("exampleButton");

  if (document.getElementById("inputText").value === exampleText) {
    exampleButton.classList.add("utilbutton-disabled");
    exampleButton.disabled = true;
  } else {
    exampleButton.disabled = false;
    exampleButton.classList.remove("utilbutton-disabled");
  }
}

function switchTokenizer(event) {
  const buttons = document.querySelectorAll(".button-model");
  console.log(event.target.value);
  buttons.forEach((button) => {
    button.classList.remove("selected");
  });
  event.target.classList.add("selected");
  convertText();
}

Array.from(document.getElementsByClassName("button-model")).forEach((button) => {
  button.addEventListener("click", switchTokenizer);
});

window.onload = function () {
  convertText();
};
