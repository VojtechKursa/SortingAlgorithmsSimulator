// Don't convert to ES module, Webpack cannot work with it
module.exports = {
    keys: ['name', 'nameMachine', 'description'],
    algorithms: [
        {
            name: "Bubble sort",
            nameMachine: "bubbleSort",
            description: "Description of Bubble sort here."
        },
        {
            name: "Bubble sort Optimized",
            nameMachine: "bubbleSortOptimized",
            description: "Description of Optimized Bubble sort here."
        }
    ]
};
