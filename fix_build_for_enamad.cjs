const fs = require('fs');

// Inject the creation of the enamad text file into the build script
let buildScript = fs.readFileSync('build_liara.sh', 'utf8');

// We need to place it in the dist folder before zipping.
const enamadCommand = `
# Add Enamad validation file
touch liara_build/dist/48183196.txt
`;

if(!buildScript.includes('48183196.txt')) {
    buildScript = buildScript.replace('cat << \'SERVER\' > liara_build/server.js', enamadCommand + '\ncat << \'SERVER\' > liara_build/server.js');
    fs.writeFileSync('build_liara.sh', buildScript);
}
