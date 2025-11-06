import 'package:flutter/material.dart';

import '../../domain/entities/example_entity.dart';

/// Example widget that displays example entity data
class ExampleWidget extends StatelessWidget {
  final ExampleEntity example;

  const ExampleWidget({
    super.key,
    required this.example,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'ID: ${example.id}',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 16),
          Text(
            'Name: ${example.name}',
            style: Theme.of(context).textTheme.bodyLarge,
          ),
        ],
      ),
    );
  }
}
