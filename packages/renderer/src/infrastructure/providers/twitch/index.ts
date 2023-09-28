import Api from './api';
import OAuth from './oauth';
import Transport from './transport';

const oauth = new OAuth();
const transport = new Transport();
const api = new Api(oauth, transport);

export default api;
