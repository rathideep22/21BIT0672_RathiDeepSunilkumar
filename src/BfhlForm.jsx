import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BfhlForm() {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState([]);

    // Set the page title when the component mounts
    useEffect(() => {
        document.title = "21BIT0672";
    }, []);

    const handleSubmit = async () => {
        setResponse(null);  // Clear previous response

        try {
            // Parse the JSON input
            const jsonData = JSON.parse(input);

            // Send the parsed JSON to the server
            const res = await axios.post('https://krishbajaj.onrender.com/bfhl', jsonData);
            console.log("Response received:", res.data);  // Debugging line

            setResponse(res.data);
        } catch (error) {
            if (error instanceof SyntaxError) {
                alert('Invalid JSON format: ' + error.message);
            } else {
                alert('API Error: ' + error.message);
            }
            console.error("Error:", error);  // Debugging line
        }
    };

    const handleOptionChange = (e) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedOptions(value);
    };

    const formatResponseAsString = (response, selectedOptions) => {
        return selectedOptions
            .filter(option => response[option] && response[option].length > 0)
            .map(option => `${option}: ${response[option].join(', ')}`)
            .join('\n');
    };

    return (
        <div className="container">
            <h1>JSON Processor</h1>
            <label>API Input</label>
            <textarea 
                id="jsonInput" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder='Enter JSON here... Example: { "data": ["A","C","Z","c","i"] }'
            />
            <button onClick={handleSubmit}>Submit</button>

            <label>Multi Filter</label>
            <select id="filterOptions" multiple onChange={handleOptionChange}>
                <option value="alphabets">Alphabets</option>
                <option value="numbers">Numbers</option>
                <option value="highest_lowercase_alphabet">Highest lowercase alphabet</option>
            </select>

            <h3>Filtered Response</h3>
            <div id="responseContainer">
                {response && selectedOptions.length > 0 ? (
                    <pre>{formatResponseAsString(response, selectedOptions)}</pre>
                ) : (
                    <p>No filters selected or no matching data found.</p>
                )}
            </div>
        </div>
    );
}

export default BfhlForm;
