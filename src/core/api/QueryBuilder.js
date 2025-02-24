class QueryBuilder {
  constructor() {
    this.query = '';
    this.variables = {};
    this.fragments = new Map();
  }

  /**
   * Add a GraphQL operation (query or mutation)
   * @param {string} operation - The operation type ('query' or 'mutation')
   * @param {string} [name] - Optional operation name
   * @param {string} [variables] - Optional variables definition
   * @returns {QueryBuilder} - Returns this for chaining
   */
  operation(operation, name, variables) {
    this.query = `${operation}${name ? ` ${name}` : ''}${variables ? `(${variables})` : ''} {\n`;
    return this;
  }

  /**
   * Add a field to the query
   * @param {string} field - The field name
   * @param {string} [alias] - Optional alias for the field
   * @param {string} [args] - Optional arguments for the field
   * @returns {QueryBuilder} - Returns this for chaining
   */
  field(field, alias, args) {
    this.query += `  ${alias ? `${alias}: ` : ''}${field}${args ? `(${args})` : ''}\n`;
    return this;
  }

  /**
   * Add a nested selection set
   * @param {string} field - The field name
   * @param {string[]} selectionSet - The nested fields
   * @param {string} [alias] - Optional alias for the field
   * @param {string} [args] - Optional arguments for the field
   * @returns {QueryBuilder} - Returns this for chaining
   */
  select(field, selectionSet, alias, args) {
    this.query += `  ${alias ? `${alias}: ` : ''}${field}${args ? `(${args})` : ''} {\n`;
    selectionSet.forEach(selection => {
      this.query += `    ${selection}\n`;
    });
    this.query += '  }\n';
    return this;
  }

  /**
   * Add a fragment definition
   * @param {string} name - Fragment name
   * @param {string} type - Type condition
   * @param {string[]} fields - Fields in the fragment
   * @returns {QueryBuilder} - Returns this for chaining
   */
  fragment(name, type, fields) {
    const fragment = `fragment ${name} on ${type} {\n${fields.map(f => `  ${f}`).join('\n')}\n}`;
    this.fragments.set(name, fragment);
    return this;
  }

  /**
   * Add a fragment spread
   * @param {string} name - Fragment name
   * @returns {QueryBuilder} - Returns this for chaining
   */
  spread(name) {
    this.query += `  ...${name}\n`;
    return this;
  }

  /**
   * Add variables to the query
   * @param {Object} variables - Variables object
   * @returns {QueryBuilder} - Returns this for chaining
   */
  setVariables(variables) {
    this.variables = { ...this.variables, ...variables };
    return this;
  }

  /**
   * Build the complete query string
   * @returns {Object} - Query and variables object
   */
  build() {
    let finalQuery = '';
    
    // Add fragments
    this.fragments.forEach(fragment => {
      finalQuery += `${fragment}\n\n`;
    });
    
    // Add main query
    finalQuery += `${this.query}}\n`;

    return {
      query: finalQuery,
      variables: this.variables
    };
  }

  /**
   * Helper method to create a basic query
   * @param {string} queryName - Query name
   * @param {string[]} fields - Fields to select
   * @param {Object} [variables] - Variables for the query
   * @param {Object} [options] - Query options
   * @returns {Object} - Query and variables object
   */
  static createQuery(queryName, fields, variables = {}, options = {}) {
    const builder = new QueryBuilder();
    
    const variableDefinitions = Object.entries(variables)
      .map(([key, value]) => `$${key}: ${typeof value === 'number' ? 'Int!' : 'String!'}`)
      .join(', ');

    builder.operation('query', queryName, variableDefinitions || null);
    
    fields.forEach(field => {
      if (typeof field === 'string') {
        builder.field(field);
      } else {
        // Handle nested fields if needed
        console.warn('Nested fields not yet implemented');
      }
    });

    if (Object.keys(variables).length > 0) {
      builder.setVariables(variables);
    }

    return builder.build();
  }
}

module.exports = { QueryBuilder }; 