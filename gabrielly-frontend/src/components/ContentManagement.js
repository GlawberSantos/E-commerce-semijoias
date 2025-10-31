import React, { useState } from 'react';
import '../styles/AdminPage.css'; // Reusing styles

function ContentManagement() {
    const [content, setContent] = useState({
        heroTitle: '',
        heroSubtitle: '',
        heroImage: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContent(prevContent => ({
            ...prevContent,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        setContent(prevContent => ({
            ...prevContent,
            heroImage: e.target.files[0]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to send content data to the backend
    };

    return (
        <div>
            <h1>Gerenciar Conteúdo</h1>
            
            <h2>Seção Hero (Página Inicial)</h2>
            <form onSubmit={handleSubmit} className="content-form">
                <div className="form-group">
                    <label htmlFor="heroTitle">Título do Hero</label>
                    <input type="text" id="heroTitle" name="heroTitle" value={content.heroTitle} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="heroSubtitle">Subtítulo do Hero</label>
                    <input type="text" id="heroSubtitle" name="heroSubtitle" value={content.heroSubtitle} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="heroImage">Imagem do Hero</label>
                    <input type="file" id="heroImage" name="heroImage" onChange={handleImageChange} />
                </div>
                <button type="submit" className="submit-button">Salvar Conteúdo</button>
            </form>
        </div>
    );
}

export default ContentManagement;