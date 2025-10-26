import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ 
    title, 
    description, 
    keywords,
    image = '/logo192.png',
    url = window.location.href
}) => {
    const siteName = 'Gabrielly Semijoias';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;

    return (
        <Helmet>
            {/* Metatags básicas */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Outras metatags importantes */}
            <meta name="robots" content="index, follow" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="theme-color" content="#ffd700" />
            <link rel="canonical" href={url} />
        </Helmet>
    );
};

export default SEO;