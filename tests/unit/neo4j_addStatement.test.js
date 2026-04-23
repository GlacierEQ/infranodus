const CypherQuery = require('../../lib/db/neo4j');

describe('CypherQuery.addStatement', () => {
    test('it should generate a cypher query and params correctly', (done) => {
        const user = { uid: 'user-123' };
        const contexts = [{ name: 'context1', uid: 'ctx-1' }];
        const statements = [{
            uid: 'st-1',
            name: 'Statement 1',
            text: 'Hello #world @someone',
            timestamp: 123456789,
            concepts: ['hello', 'world'],
            mentions: ['@someone']
        }];

        CypherQuery.addStatement(user, statements, contexts, 'link', true, (result) => {
            expect(result).toHaveProperty('query');
            expect(result).toHaveProperty('params');
            expect(result.params.userId).toBe('user-123');
            expect(result.params.statements).toHaveLength(1);
            expect(result.params.statements[0].uniqueconcepts).toContain('hello');
            expect(result.params.statements[0].uniqueconcepts).toContain('world');
            expect(result.params.statements[0].uniquementions).toContain('someone');
            done();
        });
    });

    test('it should handle duplicate concepts correctly with Set optimization', (done) => {
        const user = { uid: 'user-123' };
        const contexts = [{ name: 'context1', uid: 'ctx-1' }];
        const statements = [{
            uid: 'st-1',
            name: 'Statement 1',
            text: '#hello #hello',
            timestamp: 123456789,
            concepts: ['hello', 'hello'],
            mentions: []
        }];

        CypherQuery.addStatement(user, statements, contexts, 'link', true, (result) => {
            expect(result.params.statements[0].uniqueconcepts).toHaveLength(1);
            expect(result.params.statements[0].uniqueconcepts).toContain('hello');
            done();
        });
    });
});
