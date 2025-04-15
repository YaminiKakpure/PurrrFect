import React from 'react';
import './Places.css'; // Import Places-specific CSS
import petFriendlyImage from '../../assets/pet places.jpg'; // Import pet-friendly image
import { ChevronLeft } from 'lucide-react';

const Places = () => {
    const categories = [
        {
            id: 1,
            name: 'Parks & Open Spaces',
            image: 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwxfHxwZXQlMjB8ZW58MHx8fHwxNzM5MjU3NjUxfDA&ixlib=rb-4.0.3&q=80&w=1080',
            route: '/parks'
        },
        {
            id: 2,
            name: 'Cafés & Restaurants',
            image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwxfHxjYWZlJTIwcGV0fGVufDB8fHx8MTczOTI4MzYzNnww&ixlib=rb-4.0.3&q=80&w=1080',
            route: '/cafes'
        },
        {
            id: 3,
            name: 'Pet Markets & Stores',
            image: 'https://images.unsplash.com/photo-1562663474-6cbb3eaa4d14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHwxNXx8aG9tZXxlbnwwfHx8fDE3MzkyODMyMzl8MA&ixlib=rb-4.0.3&q=80&w=1080',
            route: '/marts'
        },
        {
            id: 4,
            name: 'Pet Hotels & Stays',
            image: 'https://images.unsplash.com/photo-1525983360072-2ebda055ba40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NTYyMDF8MHwxfHNlYXJjaHw4fHxwZXQlMjBob3RlbHxlbnwwfHx8fDE3MzkyODM0MDZ8MA&ixlib=rb-4.0.3&q=80&w=1080',
            route: '/Hotels'
        }
    ];

    return (
        <div className="places-container">
            {/* App Bar */}
            <div className="places-appbar">
                <button onClick={() => window.history.back()}>
                    <ChevronLeft size={24} />
                </button>
                <h1>Pet-Friendly Places</h1>
            </div>

            {/* Banner */}
            <div 
                className="places-banner"
                style={{ backgroundImage: `url(${petFriendlyImage})` }} // Use pet-friendly image
            >
                <h2>Explore Pet-Friendly Spots</h2>
                <p>Find the perfect places to hang out with your furry friend</p>
            </div>

            {/* Search Bar */}
            <div className="places-search-container">
                <div className="places-search-bar">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Search pet-friendly places..." />
                </div>
            </div>

            {/* Categories Grid */}
            <div className="places-grid">
                {categories.map((category) => (
                    <div 
                        key={category.id} 
                        className="places-category-card"
                        onClick={() => window.location.href = category.route} // Navigate to route
                    >
                        <img src={category.image} alt={category.name} />
                        <div className="places-category-info">
                            <h3>{category.name}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Places;