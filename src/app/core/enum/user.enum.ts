export enum UserType {
    Admin = 1,
    Customer,
    Mareking,
    Support,
    Store,
    TopManagement
};

export enum UserPath {
    Admin = 'search',
    Customer = 'home',
    Mareking = 'dashboard',
    Support = 'complains',
    Store = 'search',
    TopManagement = 'dashboard'
};

// Admin _config , dashboard
// Mareking _recomended product , dashboard
// Support _complian
// Store _serach
// Topmanagement _dashboard
// customer _home , my profile , my invoice