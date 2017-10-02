// High Order III. Closures & Lexical Retention [30 min]


// 01. Uma pilha é um tipo abstrato de dados que dispõe de duas operações.
// [push] permite inserir um elemento na pilha e [pop] remove o último 
// elemento da pilha. Sendo assim, uma pilha é caracterizada por inserir 
// elementos no mesmo ponto e ordem em que estes são inseridos. No entando
// queremos implementar uma pilha com um [undo] a mais para poder desfacer
// as operações previamente realizadas.

(function (/* 01. stack */){
    
    var Stack = function (data) {
        var items   = data || [];
        var history = [];
        return {
            push: function push (e) {
                history.push(function() { items.pop(); });
                items.push(e);
            },
            pop: function pop () {
                if (items.length > 0) {
                    var e = items.pop();
                    history.push(function() { items.push(e); });
                    return e; 
                }
            },
            undo: function undo() {
                if (history.length > 0) {
                    history.pop()();
                } 
            },
            toString: function () {
                return items.toString();
            }
        };
    };
    
    var s = Stack ([1, 2, 3]);
    s.push (4);    console.log (s.toString ()); // 1,2,3,4
    s.pop ();      console.log (s.toString ()); // 1,2,3
    s.pop ();      console.log (s.toString ()); // 1,2
    s.push (5);    console.log (s.toString ()); // 1,2,5
    
})();



// 02. Os primeiros tipos de calculadoras usavam uma técnica de cômputo 
// conhecida como notação polinominal inversa. Estes artefatos dispunham de uma
// pilha interna com a qual operavam. Em qualquer momento podemos 
// introduzir um novo dado na pilha e também podemos aplicar uma operação
// que extrai dados quando necesário do topo da pilha (em virtude de se a operação 
// ser unária ou binária) e volta a inserir o resultado da operação novamente no topo 
// Está calculadora é implementada com os métodos [data] para introduzir um novo dado 
// na pilha e [op] para invocar uma operação passada como parâmetro.

(function (/* 02. calc */){
    
    var Calc = function () {
        var stack = [];
        return {
            data: function (e) {
                stack.push (e);
            },
            op: function (fn) {
                var data = stack.slice (stack.length - fn.length);
                stack = stack.slice (0, stack.length - fn.length);
                stack.push (fn.apply (null, data));
            },
            result: function () {
                return stack.pop();
            },
            debug: function (){ console.log (stack); } 
        };
    };
    
    var add = function (x, y) { return x + y; };
    var sub = function (x, y) { return x - y; };
    var mul = function (x, y) { return x * y; };
    var div = function (x, y) { return x / y; };
    var inv = function (x) { return 1 / x; };
    var neg = function (x) { return -x; };
    var sqr = function (x) { return x * x; };
    
    var c = Calc ();
    c.data (2);     c.debug();  // [ 2 ]
    c.data (3);     c.debug();  // [ 2, 3 ]
    c.data (5);     c.debug();  // [ 2, 3, 5 ]
    c.op (mul);     c.debug();  // [ 2, 15 ]
    c.op (add);     c.debug();  // [ 17 ]
    console.log (c.result());   // 17
    
})();



// 03. Um bus é um middleware de comunicação que põe em contato um conjunto de
// produtores de dados com outro conjunto de consumidores de maneira desacoplada a 
// través de uma arquitetura de eventos. O bus dispõe de um método [send] que
// permite emitir um evento a um conjunto de clientes anexando um contexto de dados.
// Também, dispõe de um método [receive] que permite aos clientes registrarem
// um determinado tipo particular de evento. Para fazer isso esta função solicita 
// como parâmetros o nome do evento e a função manipuladora que o bus invocará 
// quando reciber um evento deste tipo. Além disso, esta função devolve uma função
// encarregada de realizar a remoção deste cliente.

(function (/* 03. bus */){
    
    var Bus = function () {
        var fns = {};
        return {
            receive: function (e, fn) {
                fns[e]  = fns[e] ? fns[e].concat (fn) : [fn];
                var idx = fns[e].length - 1;
                return function () {
                    fns[e].splice (idx, 1);
                };
            },
            send: function (e, ctx) {
                fns[e].forEach (function (fn) {
                    return fn.apply (null, ctx.concat (e));
                });
            }
        }; 
    };
    
    var add = function (x, y, e) { console.log ('add - { on: %s, [x:%d, y:%d], result: [%d] }', e, x, y, x + y); };
    var mul = function (x, y, e) { console.log ('mul - { on: %s, [x:%d, y:%d], result: [%d] }', e, x, y, x * y); };
    var bus = Bus ();
    var f0 = bus.receive ('X', add);
    var f1 = bus.receive ('Y', add);
    var f2 = bus.receive ('Y', mul);
    bus.send ('X', [2,3]);      // add - { on: X, [x:2, y:3], result: [5] }
    bus.send ('Y', [3,5]);      // add - { on: Y, [x:3, y:5], result: [8] }
                                // mul - { on: Y, [x:3, y:5], result: [15] }
    
    f1();
    
    bus.send ('Y', [6,3]);      // mul - { on: Y, [x:6, y:3], result: [18] }
    bus.send ('Y', [6,5]);      // mul - { on: Y, [x:6, y:5], result: [30] }
})();


// 04. Uma das características que os desenvolvedores de linguagens orientadas
// a objetos sentem falta no JS é a possibilidade de sobrecarregar uma função. Isto é,
// funções com o mesmo nome, mas com um número diferente de parâmetros e com outro corpo
// de sentenças. Os compiladores destas linguagens sabem distinguir em tempo de 
// execução qual versão da função é chamada em virtde do número de argumentos
// atuais que recebe em cada momento.

(function (/* 04. overload */){
    
        var overload = function () {
            var fns = [].slice.call(arguments);
            return function () {
                var args = [].slice.call(arguments);
                var fn = fns.filter(function (fn) {
                    return fn.length === args.length;
                })[0];
                if (fn) return fn.apply(this, args);
            };
        };
    
    var add = overload (
        function (x)       { return x; },
        function (x, y)    { return x + y; },
        function (x, y, z) { return x + y + z; }
    );
    console.log (
        add (2),    // 2
        add (2,3),  // 5
        add (2,3,5) // 10
    );

})();


// 05. Os frameworks de provas tipo o Jasmine permitem definir testes
// unitários que se executam em batería e servem para comprovar a 
// correção do código. Este tipo de biblioteca inclui uma função
// [it] que representa um test e recebe como parâmetros uma descrição
// para a prova e uma função fn com o corpo da dita prova.
// Todos os testes definidos mediante [it] se incluem dentro de uma
// função [describe] como argumentos atuais. Implementamos um
// mini jasmine?

(function (/* 05. describe */){
    
    var describe = function (suite) {
        return function () {
            var its = [].slice.call(arguments);
            var results = its.map (function (it) {
                return it.apply(this, arguments);
            }, this);
            return {
                suite  : suite,
                result : results
            };
        }; 
    };
    var it = function (test, fn) {
        return function () {
            return {
                test   : test,
                result : fn.apply(this, arguments)
            }; 
        };
    };
    
    console.log (
        describe ('Test Suite')(
            it('test 1', function () {
                return 2 + 3 === 5;
            }),
            it('test 2', function () {
                return 2 - 3 === 5;
            })
        ) 
    );
    
    // { suite  : 'Test Suite',
    //   result : [
    //     { test: 'test 1', result: true  },
    //     { test: 'test 2', result: false } 
    //   ]
    // }
   
})();
