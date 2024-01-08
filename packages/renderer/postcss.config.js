import postcssNested from 'postcss-nested';
import postcssExtendRule from 'postcss-extend-rule';

export default {
  plugins: [
    postcssNested,
    postcssExtendRule,
  ],
};

// module.exports = {
//   plugins: [
//     require('postcss-nested'),
//     require('postcss-extend-rule'),
//   ],
// };
