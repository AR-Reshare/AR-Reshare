test('Not Implemented', () => {
    expect(true).toBe(true);
});

// Class 1: Valid (non-parameterised) reading query.
// SELECT userid FROM Account WHERE fullname = 'Testy McTestface'

// Class 2: Valid (non-parameterised) writing query.
// INSERT INTO Account (FullName, Email, PassHash, DoB) VALUES ('Kevin McTestface', 'kevmct@gmail.com', '$2a$12$zmdLgiclytrKGXRF7iNDfufusYm1YNEy7sRTEPg7W3LoLIfY/hBA6', '1986-03-12')

// Class 3: Valid parameterised query.
// SELECT userid FROM Account WHERE fullname = $1
// $1: Testy McTestface

// Class 4: Parameterised query with more values provided than are required
// SELECT userid FROM Account WHERE fullname = $1
// $1: Testy McTestface
// $2: Ronnie Omelettes

// Class 5: Parameterised query with parameters which can be typecast appropriately
// SELECT userid FROM Account WHERE dob = $1
// $1: datetime representing 1990-01-01

// Class 6: Query with syntax errors
// SELCT userid FROM Account WHERE fullname = 'Testy McTestface'

// Class 7: Query with schema errors
// SELECT notarow FROM Account WHERE fullname = 'Testy McTestface'

// Class 8: Parameterised query with fewer values provided than are used.
// SELECT userid FROM Account WHERE fullname = $1 AND email = $2
// $1: Testy McTestface

// Class 9: Parameterised query with values argument undefined.
// SELECT userid FROM Account WHERE fullname = $1

// Class 10: Parameterised query with parameters which cannot be typecast appropriately
// SELECT userid FROM Account WHERE dob = $1
// $1: Testy McTestface

// Class 11: Parameterised query with attempted SQL injection.
// SELECT userid FROM Account WHERE fullname = $1
// $1: ' OR 1=1; --
