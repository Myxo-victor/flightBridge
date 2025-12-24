const flightBridge = {
    // 1. DYNAMIC BRIDGE DETECTION
    _bridgeUrl: (function() {
        const script = document.currentScript;
        if (script && script.src) {
            const url = new URL(script.src);
            const pathParts = url.pathname.split('/');
            pathParts.pop(); 
            const folderPath = pathParts.join('/');
            return `${url.origin}${folderPath}/flight.php`;
        }
        return 'https://raw.githubusercontent.com/Myxo-victor/venjs/main/flight.php';
    })(),

    // 2. DATABASE OPERATIONS (The Core Engine)
    db: {
        _execute: async (action, table, data = null, id = null, params = {}) => {
            const config = window._fb_db_config || {}; 
            try {
                const response = await fetch(flightBridge._bridgeUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ config, action, table, data, id, ...params })
                });
                return await response.json();
            } catch (err) {
                console.error("flightBridge Error:", err);
                return { success: false, error: "Connection to bridge failed" };
            }
        },

        // Setup credentials
        connect: (config, customUrl = null) => { 
            window._fb_db_config = config; 
            if (customUrl) flightBridge._bridgeUrl = customUrl;
        },

        // API Methods
        insert: (table, data) => flightBridge.db._execute('insert', table, data),
        fetch: (table, queryParams = {}) => flightBridge.db._execute('fetch', table, null, null, { params: queryParams }),
        update: (table, id, data) => flightBridge.db._execute('update', table, data, id),
        delete: (table, id) => flightBridge.db._execute('delete', table, null, id),
        search: (table, column, value) => flightBridge.db._execute('search', table, null, null, { search: { column, value } }),
        
        // Custom NLP/Query (As requested for your PHP NLP tasks)
        raw: (sql, params = []) => flightBridge.db._execute('raw', null, null, null, { sql, params })
    },

    // 3. UI ENGINE
    createElement: (tag, props = {}, children = []) => {
        const element = document.createElement(tag);
        Object.entries(props).forEach(([key, value]) => {
            if (key === 'events') {
                Object.entries(value).forEach(([ev, fn]) => element.addEventListener(ev, fn));
            } else if (key === 'style') {
                Object.assign(element.style, value);
            } else if (key in element) {
                element[key] = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        children.forEach(child => {
            if (typeof child === 'string' || typeof child === 'number') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
        return element;
    },

    // 4. STATE MANAGEMENT
    createStore: (initialState) => {
        let state = { ...initialState };
        const listeners = [];
        return {
            getState: () => state,
            setState: (newState) => {
                state = { ...state, ...newState };
                listeners.forEach(l => l(state));
            },
            subscribe: (l) => {
                listeners.push(l);
                return () => listeners.splice(listeners.indexOf(l), 1);
            }
        };
    },

    // 5. MOUNTING FUNCTION (Renamed to .flight())
    flight: (appElement, component) => {
        if (appElement) {
            appElement.innerHTML = '';
            appElement.appendChild(component());
        } else {
            console.error("Flight Error: Target element not found for mounting.");
        }
    }
};
