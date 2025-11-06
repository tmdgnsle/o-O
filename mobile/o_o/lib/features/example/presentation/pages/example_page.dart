import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/example_bloc.dart';
import '../bloc/example_event.dart';
import '../bloc/example_state.dart';
import '../widgets/example_widget.dart';

/// Example page that uses BLoC for state management
class ExamplePage extends StatelessWidget {
  const ExamplePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Example Page'),
      ),
      body: BlocBuilder<ExampleBloc, ExampleState>(
        builder: (context, state) {
          if (state is ExampleInitial) {
            return const Center(
              child: Text('Press the button to load data'),
            );
          } else if (state is ExampleLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          } else if (state is ExampleLoaded) {
            return ExampleWidget(example: state.example);
          } else if (state is ExampleError) {
            return Center(
              child: Text('Error: ${state.message}'),
            );
          }
          return const SizedBox();
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          context.read<ExampleBloc>().add(
                const GetExampleEvent('1'),
              );
        },
        child: const Icon(Icons.refresh),
      ),
    );
  }
}
