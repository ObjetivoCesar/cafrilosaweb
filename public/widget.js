// widget.js

const WEBHOOK_URL = "https://hook.us2.make.com/ja7j9ib2mticm1eakc1cx0vvp6srm6gk";
const WELCOME_MESSAGE = "¡Hola! Soy el asistente virtual de Cafrilosa. ¿En qué puedo ayudarte hoy? Puedo brindarte información sobre nuestros productos, precios, disponibilidad o cualquier otra consulta.";
const USER_ID_KEY = "cafrilosa_user_id";
const CHAT_MESSAGES_KEY = "cafrilosa_chat_messages";

let isOpen = false;
let messages = [];
let userId = "";
let isLoading = false;

const chatWidgetContainer = document.createElement("div");
chatWidgetContainer.id = "chat-widget-container";
document.body.appendChild(chatWidgetContainer);

const renderWidget = () => {
    chatWidgetContainer.innerHTML = ""; // Clear previous content

    if (!isOpen) {
        chatWidgetContainer.innerHTML = `
            <button id="open-chat-btn" class="chat-toggle-btn">
                <img src="public/images/CAFRILOSA_logo.png" alt="Cafrilosa Logo" class="chat-logo-btn">
            </button>
        `;
        document.getElementById("open-chat-btn").onclick = () => {
            isOpen = true;
            renderWidget();
            initializeWelcomeMessage();
        };
    } else {
        chatWidgetContainer.innerHTML = `
            <div class="chat-window">
                <div class="chat-header">
                    <div class="chat-header-info">
                        <img src="public/images/CAFRILOSA_logo.png" alt="Cafrilosa Logo" class="chat-logo-header">
                        <h3 class="chat-title">Chat con Cafrilosa</h3>
                    </div>
                    <div class="chat-header-actions">
                        <button id="clear-chat-btn" class="chat-icon-btn" title="Limpiar chat">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        <button id="close-chat-btn" class="chat-icon-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div id="chat-messages" class="chat-messages"></div>
                <div class="chat-input-area">
                    <input type="text" id="chat-input" placeholder="Escribe un mensaje..." class="chat-input">
                    <button id="send-chat-btn" class="chat-send-btn">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        document.getElementById("close-chat-btn").onclick = () => {
            isOpen = false;
            renderWidget();
        };
        document.getElementById("clear-chat-btn").onclick = clearChat;
        document.getElementById("send-chat-btn").onclick = handleSendMessage;
        document.getElementById("chat-input").addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
        renderMessages();
    }
};

const initializeUserId = () => {
    let storedUserId = localStorage.getItem(USER_ID_KEY);
    if (storedUserId) {
        userId = storedUserId;
    } else {
        const newUserId = `user_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem(USER_ID_KEY, newUserId);
        userId = newUserId;
    }
};

const loadMessages = () => {
    const savedMessages = localStorage.getItem(CHAT_MESSAGES_KEY);
    if (savedMessages) {
        try {
            messages = JSON.parse(savedMessages);
        } catch (error) {
            console.error("Error al cargar mensajes guardados:", error);
            initializeWelcomeMessage();
        }
    } else {
        initializeWelcomeMessage();
    }
};

const saveMessages = () => {
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
};

const initializeWelcomeMessage = () => {
    if (messages.length === 0 || messages[0].id !== "welcome") {
        const welcomeMessage = {
            id: "welcome",
            text: WELCOME_MESSAGE,
            sender: "assistant",
            timestamp: Date.now(),
        };
        messages = [welcomeMessage];
        saveMessages();
    }
};

const renderMessages = () => {
    const chatMessagesDiv = document.getElementById("chat-messages");
    if (!chatMessagesDiv) return;

    chatMessagesDiv.innerHTML = "";
    messages.forEach(message => {
        const messageDiv = document.createElement("div");
        messageDiv.className = `chat-message ${message.sender === "user" ? "user-message" : "assistant-message"}`;

        let logoHtml = "";
        if (message.sender === "assistant") {
            logoHtml = `<div class="chat-logo-message-container">
                            <img src="public/images/CAFRILOSA_logo.png" alt="Asistente" class="chat-logo-message">
                        </div>`;
        }

        const formattedText = message.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                        .replace(/\*(.*?)\*/g, "<em>$1</em>")
                                        .replace(/\n/g, "<br />");

        messageDiv.innerHTML = `
            ${logoHtml}
            <div class="message-bubble">
                <p class="message-text">${formattedText}</p>
                <span class="message-time">${formatTime(message.timestamp)}</span>
            </div>
        `;
        chatMessagesDiv.appendChild(messageDiv);
    });

    if (isLoading) {
        const loadingDiv = document.createElement("div");
        loadingDiv.className = "chat-message assistant-message";
        loadingDiv.innerHTML = `
            <div class="chat-logo-message-container">
                <img src="public/images/CAFRILOSA_logo.png" alt="Asistente" class="chat-logo-message">
            </div>
            <div class="message-bubble">
                <div class="loading-dots">
                    <div class="dot"></div>
                    <div class="dot" style="animation-delay: 0.2s;"></div>
                    <div class="dot" style="animation-delay: 0.4s;"></div>
                </div>
            </div>
        `;
        chatMessagesDiv.appendChild(loadingDiv);
    }

    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
};

const handleSendMessage = async () => {
    const chatInput = document.getElementById("chat-input");
    const inputValue = chatInput.value.trim();

    if (!inputValue) return;

    const userMessage = {
        id: `msg_${Date.now()}`,
        text: inputValue,
        sender: "user",
        timestamp: Date.now(),
    };

    messages.push(userMessage);
    saveMessages();
    chatInput.value = "";
    isLoading = true;
    renderMessages();

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: userId,
                message: inputValue,
                platform: "web",
                timestamp: new Date().toISOString(),
            }),
        });

        const responseText = await response.text();

        if (response.ok && responseText && responseText.trim()) {
            messages.push({
                id: `msg_${Date.now()}`,
                text: responseText.trim(),
                sender: "assistant",
                timestamp: Date.now(),
            });
        } else {
            throw new Error("No se recibió respuesta válida del servidor");
        }
    } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        messages.push({
            id: `msg_${Date.now()}`,
            text: "Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, intenta nuevamente más tarde.",
            sender: "assistant",
            timestamp: Date.now(),
        });
    } finally {
        isLoading = false;
        saveMessages();
        renderMessages();
    }
};

const clearChat = () => {
    messages = [];
    localStorage.removeItem(CHAT_MESSAGES_KEY);
    initializeWelcomeMessage();
    renderMessages();
};

const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    initializeUserId();
    loadMessages();
    renderWidget();
});


